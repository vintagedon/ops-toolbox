import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import SettingsFlyout from '../../src/components/SettingsFlyout';
import { THEMES } from '../../src/hooks/useTheme';

function makeProps(overrides = {}) {
  return {
    theme: {
      preference: 'system',
      setTheme: vi.fn(),
      themes: THEMES,
      ...overrides.theme,
    },
    density: {
      density: 'default',
      setDensity: vi.fn(),
      ...overrides.density,
    },
    fontFamily: {
      fontFamily: 'system',
      setFontFamily: vi.fn(),
      ...overrides.fontFamily,
    },
  };
}

function openFlyout(props) {
  render(<SettingsFlyout {...props} />);
  fireEvent.click(screen.getByLabelText('Display settings'));
}

describe('SettingsFlyout', () => {
  it('renders the settings button and opens on click', () => {
    openFlyout(makeProps());
    expect(screen.getByRole('dialog', { name: 'Display settings' })).toBeInTheDocument();
  });

  it('renders one theme option per declared theme in the menu', () => {
    openFlyout(makeProps());
    const group = screen.getByRole('radiogroup', { name: 'Theme selection' });
    THEMES.forEach((t) => {
      expect(group).toHaveTextContent(t.label);
    });
  });

  it('marks the current preference as checked', () => {
    openFlyout(makeProps({ theme: { preference: 'dark' } }));
    const dark = screen.getByRole('radio', { name: 'Dark' });
    expect(dark).toHaveAttribute('aria-checked', 'true');
    const light = screen.getByRole('radio', { name: 'Light' });
    expect(light).toHaveAttribute('aria-checked', 'false');
  });

  it('calls theme.setTheme when a theme option is selected', () => {
    const props = makeProps();
    openFlyout(props);
    fireEvent.click(screen.getByRole('radio', { name: 'Light' }));
    expect(props.theme.setTheme).toHaveBeenCalledWith('light');
  });

  it('renders density and font segmented controls that call through', () => {
    const props = makeProps();
    openFlyout(props);
    fireEvent.click(screen.getByRole('button', { name: 'Compact' }));
    expect(props.density.setDensity).toHaveBeenCalledWith('compact');
    fireEvent.click(screen.getByRole('button', { name: 'Inter' }));
    expect(props.fontFamily.setFontFamily).toHaveBeenCalledWith('inter');
  });

  it('closes on Escape', () => {
    openFlyout(makeProps());
    fireEvent.keyDown(document, { key: 'Escape' });
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('renders every declared theme from the real list, including High-Contrast Slate', () => {
    openFlyout(makeProps({ theme: { preference: 'slate', themes: THEMES } }));
    const group = screen.getByRole('radiogroup', { name: 'Theme selection' });
    THEMES.forEach((t) => {
      expect(group).toHaveTextContent(t.label);
    });
    expect(screen.getByRole('radio', { name: 'High-Contrast Slate' })).toHaveAttribute('aria-checked', 'true');
  });
});
