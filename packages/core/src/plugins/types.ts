import type { Form } from "../form";
import type { Field } from "../fields";

/**
 * The base plugin interface.
 * Plugins can hook into forms, fields, registry, events, etc.
 * Extend this for more advanced plugin contracts.
 */
export interface AcfKitPlugin {
  name: string;
  /**
   * Called when the plugin is registered.
   * Receives the form instance (or undefined if global).
   */
  install?(form?: Form): void;

  /**
   * Called when the plugin is unregistered.
   * Receives the form instance (or undefined if global).
   */
  uninstall?(form?: Form): void;

  // Optionally, plugins can add more hooks/events as needed
  // e.g. onFieldChange, onValidate, etc.
}
