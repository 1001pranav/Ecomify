/**
 * Template Method Pattern - Notification Template Interface
 * Defines the structure for rendering notification templates
 */
export interface NotificationTemplateRenderer {
  /**
   * Render template with data
   * @param template - Template string
   * @param data - Data to inject into template
   * @returns Rendered content
   */
  render(template: string, data: Record<string, any>): string;

  /**
   * Compile template for reuse
   * @param template - Template string
   * @returns Compiled template function
   */
  compile(template: string): any;
}
