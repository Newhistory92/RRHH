
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function parseAIResponse(aiText: string): any {
  try {
    const jsonMatch = aiText.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }
    return {};
  } catch (error) {
    console.error("Error parseando respuesta IA:", error);
    return {};
  }
}