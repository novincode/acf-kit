import type { AcfKitPlugin } from "./types";
import type { Form } from "../form";

/**
 * Plugin registry (global for now, can be per-form later).
 */
const plugins: AcfKitPlugin[] = [];

/**
 * Register a plugin (global or for a specific form).
 */
export function registerPlugin(plugin: AcfKitPlugin, form?: Form) {
  plugins.push(plugin);
  plugin.install?.(form);
}

/**
 * Unregister a plugin.
 */
export function unregisterPlugin(plugin: AcfKitPlugin, form?: Form) {
  const idx = plugins.findIndex(p => p === plugin);
  if (idx !== -1) {
    plugins.splice(idx, 1);
    plugin.uninstall?.(form);
  }
}

/**
 * Get all registered plugins.
 */
export function getPlugins(): AcfKitPlugin[] {
  return [...plugins];
}
