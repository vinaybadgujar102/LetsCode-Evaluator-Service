export default function codeCreator(
  startingCode: string,
  middleCode: string,
  endingCode: string
): string {
  return `
${startingCode}


${middleCode}


${endingCode}
`;
}

/**
 * for python endCode can be passed as empty string
 *
 * for java endCode can be passed as empty string
 */
