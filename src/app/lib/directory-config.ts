import fs from "fs";

export class PathManager {
  static getDesktopPath() {
      throw new Error("Method not implemented.");
  }
  private static readonly DEFAULT_DIRECTORY = "D:\\Mi Documentos\\Documents\\RRHH\\";

  /**
   * Obtiene el directorio de trabajo configurado
   */
  static getWorkingDirectory(): string {
    const directory = this.DEFAULT_DIRECTORY;
    
    if (fs.existsSync(directory)) {
      console.log(`Directorio de trabajo encontrado: ${directory}`);
      return directory;
    }
    
    console.warn(`Directorio configurado no existe: ${directory}`);
    console.log("Asegúrate de que el directorio existe o cámbialo en PathManager.DEFAULT_DIRECTORY");
    return directory; // Devolvemos la ruta configurada aunque no exista
  }
}