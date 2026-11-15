/**
 * @file TextTransformer.test.jsx
 * @description Workspace interactions, stale output protection and UTF-8 file contracts
 * @license MIT
 * @see https://github.com/vintagedon/ops-toolbox
 */
import { afterEach, describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import TextTransformer from '../../src/tools/TextTransformer.jsx';

const F2 = 'a\n \t\n\u00A0\n\u200B\n\uFEFF\nb';
const input = () => screen.getByLabelText('Input');
const preview = () => screen.getByRole('textbox', { name: 'Preview' });
const click = name => fireEvent.click(screen.getByRole('button', { name, exact: true }));
const ready = () => waitFor(() => expect(screen.getByText('Preview is current.')).toBeInTheDocument());
const edit = value => fireEvent.change(input(), { target: { value } });
const add = type => {
  fireEvent.change(screen.getByLabelText('Operation'), { target: { value: type } });
  click('Add operation');
};
const upload = file => fireEvent.change(screen.getByLabelText(/Import UTF-8 file/), { target: { files: [file] } });

function typeAtEnd(text) {
  const field = input();
  field.focus();
  field.setSelectionRange(field.value.length, field.value.length);
  // Model the browser's change event after inserting at the textarea caret.
  edit(field.value.slice(0, field.selectionStart) + text + field.value.slice(field.selectionEnd));
}

function captureDownload() {
  let downloaded;
  vi.stubGlobal('URL', class extends URL {
    static createObjectURL = vi.fn(blob => { downloaded = blob; return 'blob:test'; });
    static revokeObjectURL = vi.fn();
  });
  vi.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(() => {});
  return async () => {
    click('Download .txt');
    return new Promise(resolve => {
      const reader = new FileReader();
      reader.onload = () => resolve(new Uint8Array(reader.result));
      reader.readAsArrayBuffer(downloaded);
    });
  };
}

afterEach(() => {
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
});

describe('TextTransformer', () => {
  it('cleans F2 and copies the preview with no operation interaction', async () => {
    const writeText = vi.fn().mockResolvedValue();
    Object.defineProperty(navigator, 'clipboard', { value: { writeText }, configurable: true });
    render(<TextTransformer />);
    expect(screen.getAllByRole('listitem')).toHaveLength(1);
    expect(screen.getByLabelText('Enabled')).toBeChecked();
    edit(F2);
    await ready();
    expect(preview().textContent).toBe('a\n\nb');
    expect(input()).toHaveValue(F2);
    click('Copy');
    expect(writeText).toHaveBeenCalledWith('a\n\nb');
  });

  it('blocks Copy and Download immediately while an enabled operation is edited', async () => {
    render(<TextTransformer />);
    edit('a');
    add('prefix');
    await ready();
    expect(screen.getByRole('button', { name: 'Copy', exact: true })).toBeEnabled();
    fireEvent.change(screen.getByLabelText('Literal text'), { target: { value: '> ' } });
    expect(screen.getByRole('button', { name: 'Copy', exact: true })).toBeDisabled();
    expect(screen.getByRole('button', { name: 'Download .txt' })).toBeDisabled();
    expect(screen.getByRole('button', { name: 'Apply', exact: true })).toBeDisabled();
    await ready();
    expect(preview().textContent).toBe('> a');
  });

  it('Apply clears operations and Undo Apply restores input and the exact ordered options', async () => {
    render(<TextTransformer />);
    edit(F2);
    add('prefix');
    fireEvent.change(screen.getByLabelText('Literal text'), { target: { value: '> ' } });
    click('Move operation 2 up');
    fireEvent.click(within(screen.getAllByRole('listitem')[1]).getByLabelText('Enabled'));
    const before = screen.getAllByRole('listitem').map(item => item.textContent);
    await ready();
    const expected = preview().textContent;
    click('Apply');
    expect(input()).toHaveValue(expected);
    expect(screen.queryAllByRole('listitem')).toHaveLength(0);
    click('Undo Apply');
    expect(input()).toHaveValue(F2);
    expect(screen.getAllByRole('listitem').map(item => item.textContent)).toEqual(before);
    expect(screen.getByLabelText('Literal text')).toHaveValue('> ');
    expect(within(screen.getAllByRole('listitem')[1]).getByLabelText('Enabled')).not.toBeChecked();
  });

  it('retains exactly ten undo snapshots after eleven Applies', async () => {
    render(<TextTransformer />);
    for (let i = 1; i <= 11; i++) {
      edit(`input ${i}`);
      await ready();
      click('Apply');
    }
    expect(screen.getByText('10/10 undo steps')).toBeInTheDocument();
    for (let i = 0; i < 10; i++) click('Undo Apply');
    expect(input()).toHaveValue('input 2');
    expect(screen.getByRole('button', { name: 'Undo Apply' })).toBeDisabled();
    expect(screen.queryAllByRole('listitem')).toHaveLength(0);
  }, 10000);

  it('rejects oversized, invalid UTF-8 and NUL files with the entire prior state intact', async () => {
    render(<TextTransformer />);
    edit('keep me');
    await ready();
    const files = [
      [new File([new Uint8Array(2 * 1024 * 1024 + 1)], 'big.txt'), /no larger than 2 MiB/],
      [new File([new Uint8Array([0xC3, 0x28])], 'invalid.txt'), /not valid UTF-8/],
      [new File(['bad\0text'], 'nul.txt'), /contains NUL/],
    ];
    for (const [file, error] of files) {
      upload(file);
      await screen.findByText(error);
      expect(input()).toHaveValue('keep me');
      expect(preview().textContent).toBe('keep me');
      expect(screen.getAllByRole('listitem')).toHaveLength(1);
    }
  });

  it('imports BOM + F4 and downloads BOM + collapsed CRLF bytes', async () => {
    let downloaded;
    URL.createObjectURL = vi.fn(blob => { downloaded = blob; return 'blob:test'; });
    URL.revokeObjectURL = vi.fn();
    vi.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(() => {});
    render(<TextTransformer />);
    upload(new File(['\uFEFFa\r\n\r\n\r\nb\r\n'], 'windows.txt'));
    await waitFor(() => expect(input().value).toBe('a\n\n\nb\n'));
    await ready();
    expect(preview().textContent).toBe('a\r\n\r\nb\r\n');
    click('Download .txt');
    const bytes = await new Promise(resolve => {
      const reader = new FileReader();
      reader.onload = () => resolve(new Uint8Array(reader.result));
      reader.readAsArrayBuffer(downloaded);
    });
    expect(Array.from(bytes)).toEqual(Array.from(new TextEncoder().encode('\uFEFFa\r\n\r\nb\r\n')));
    expect(URL.revokeObjectURL).toHaveBeenCalledWith('blob:test');
  });

  it('accepts the 2 MiB boundary without truncation', async () => {
    render(<TextTransformer />);
    const text = 'a'.repeat(2 * 1024 * 1024);
    upload(new File([text], 'boundary.txt'));
    await waitFor(() => expect(input().value.length).toBe(text.length));
    await ready();
    expect(preview().textContent).toBe(text);
  });

  it.each([
    ['F4', 'a\r\n\r\n\r\nb\r\n', 'a\r\n\r\nb\r\nc'],
    ['F5', 'a\r\rb', 'a\r\rbc'],
  ])('preserves %s file line endings when typing c at the end and downloading', async (_, text, expected) => {
    const downloadBytes = captureDownload();
    render(<TextTransformer />);
    upload(new File([text], 'uniform.txt'));
    await waitFor(() => expect(input().value).toBe(text.replace(/\r\n|\r/g, '\n')));
    typeAtEnd('c');
    await ready();
    expect(Array.from(await downloadBytes())).toEqual(Array.from(new TextEncoder().encode(expected)));
  });

  it('restores CRLF throughout pasted F4 source and its new baseline', async () => {
    const downloadBytes = captureDownload();
    vi.spyOn(window, 'confirm').mockReturnValue(true);
    render(<TextTransformer />);
    upload(new File(['a\r\n\r\n\r\nb\r\n'], 'windows.txt'));
    await waitFor(() => expect(input().value).toBe('a\n\n\nb\n'));
    input().setSelectionRange(input().value.length, input().value.length);
    fireEvent.paste(input(), { clipboardData: { getData: () => 'x\ny' } });
    // Disable Collapse so downloaded bytes expose the complete source, including every terminator.
    fireEvent.click(screen.getByLabelText('Enabled'));
    await ready();
    const expected = Array.from(new TextEncoder().encode('a\r\n\r\n\r\nb\r\nx\r\ny'));
    expect(Array.from(await downloadBytes())).toEqual(expected);
    typeAtEnd('c');
    click('Restore original');
    expect(window.confirm).toHaveBeenCalledOnce();
    await ready();
    expect(Array.from(await downloadBytes())).toEqual(expected);
  });

  it('keeps LF output and the mixed-ending notice after typing into imported F12', async () => {
    const downloadBytes = captureDownload();
    render(<TextTransformer />);
    upload(new File(['a\r\n\nb\r'], 'mixed.txt'));
    await screen.findByText(/Mixed line endings imported/);
    typeAtEnd('c');
    await ready();
    expect(screen.getByText(/Mixed line endings imported/)).toBeInTheDocument();
    expect(Array.from(await downloadBytes())).toEqual(Array.from(new TextEncoder().encode('a\n\nb\nc')));
  });

  it('restores the pasted baseline after editing, honors cancellation, and keeps the pipeline', async () => {
    const confirm = vi.spyOn(window, 'confirm').mockReturnValue(false);
    render(<TextTransformer />);
    fireEvent.paste(input(), { clipboardData: { getData: () => F2 } });
    edit('manual edit');
    click('Restore original');
    expect(confirm).toHaveBeenCalledOnce();
    expect(input()).toHaveValue('manual edit');
    confirm.mockReturnValue(true);
    click('Restore original');
    expect(input()).toHaveValue(F2);
    expect(screen.getAllByRole('listitem')).toHaveLength(1);
    await ready();
    expect(preview().textContent).toBe('a\n\nb');
  });

  it('keeps the caret after pasted text so typing continues there', async () => {
    render(<TextTransformer />);
    edit('abc');
    const field = input();
    field.focus();
    field.setSelectionRange(1, 1);
    fireEvent.paste(field, { clipboardData: { getData: () => 'XY' } });
    expect(field).toHaveValue('aXYbc');
    expect(field.selectionStart).toBe(3);
    expect(field.selectionEnd).toBe(3);
    edit(field.value.slice(0, field.selectionStart) + 'z' + field.value.slice(field.selectionEnd));
    expect(field).toHaveValue('aXYzbc');
    await ready();
    expect(preview().textContent).toBe('aXYzbc');
  });

  it('reports mixed imported endings and uses LF output', async () => {
    render(<TextTransformer />);
    upload(new File(['a\r\n\nb\r'], 'mixed.txt'));
    await screen.findByText(/Mixed line endings imported/);
    await ready();
    expect(preview().textContent).toBe('a\n\nb\n');
  });

  it('blocks invalid operations, then permits disabling or removing them', async () => {
    render(<TextTransformer />);
    edit('hello');
    add('replace');
    await screen.findByText('Find text must not be empty.');
    expect(input()).toHaveValue('hello');
    expect(screen.getByRole('button', { name: 'Copy', exact: true })).toBeDisabled();
    expect(screen.getByRole('button', { name: 'Download .txt' })).toBeDisabled();
    fireEvent.click(within(screen.getAllByRole('listitem')[1]).getByLabelText('Enabled'));
    await ready();
    expect(preview().textContent).toBe('hello');
    click('Remove operation 2');
    expect(screen.getAllByRole('listitem')).toHaveLength(1);
  });
});
