/**
 * A utility function to conditionally join class names together.
 * It filters out any falsy values (false, null, undefined) and joins the remaining strings with a space.
 *
 * @param classes - A list of class names or conditional class expressions.
 * @returns A single string containing all valid class names separated by a space.
 */
export const cn = (
  ...classes: Array<string | false | null | undefined>
): string => classes.filter(Boolean).join(' ')
