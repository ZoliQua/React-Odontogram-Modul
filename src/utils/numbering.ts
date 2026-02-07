export type NumberingSystem = "FDI" | "UNIVERSAL" | "PALMER";

function normalizeFdi(input: number | string): number | null {
  const num = typeof input === "number" ? input : Number(input);
  if(!Number.isFinite(num)) return null;
  return Math.trunc(num);
}

function isAdultFdi(fdi: number): boolean {
  return (fdi >= 11 && fdi <= 18)
    || (fdi >= 21 && fdi <= 28)
    || (fdi >= 31 && fdi <= 38)
    || (fdi >= 41 && fdi <= 48);
}

function isPrimaryFdi(fdi: number): boolean {
  return (fdi >= 51 && fdi <= 55)
    || (fdi >= 61 && fdi <= 65)
    || (fdi >= 71 && fdi <= 75)
    || (fdi >= 81 && fdi <= 85);
}

export function toLabel(fdiTooth: number | string, system: NumberingSystem): string {
  const fdi = normalizeFdi(fdiTooth);
  if(fdi === null) return String(fdiTooth);

  if(system === "FDI"){
    return String(fdi);
  }

  const quadrant = Math.floor(fdi / 10);
  const position = fdi % 10;

  if(!isAdultFdi(fdi) && !isPrimaryFdi(fdi)){
    return String(fdi);
  }

  if(system === "UNIVERSAL"){
    if(isPrimaryFdi(fdi)){
      if(quadrant === 5){
        return String.fromCharCode(65 + (5 - position));
      }
      if(quadrant === 6){
        return String.fromCharCode(70 + (position - 1));
      }
      if(quadrant === 7){
        return String.fromCharCode(75 + (5 - position));
      }
      if(quadrant === 8){
        return String.fromCharCode(80 + (position - 1));
      }
    }
    // Deterministic adult mapping based on FDI quadrants.
    if(quadrant === 1){
      // Maxilla right: 18 -> 1, 11 -> 8
      return String(9 - position);
    }
    if(quadrant === 2){
      // Maxilla left: 21 -> 9, 28 -> 16
      return String(8 + position);
    }
    if(quadrant === 3){
      // Mandible left: 38 -> 17, 31 -> 24
      return String(25 - position);
    }
    if(quadrant === 4){
      // Mandible right: 41 -> 25, 48 -> 32
      return String(24 + position);
    }
  }

  if(system === "PALMER"){
    let quadLabel = "";
    if(quadrant === 1) quadLabel = "UR";
    if(quadrant === 2) quadLabel = "UL";
    if(quadrant === 3) quadLabel = "LL";
    if(quadrant === 4) quadLabel = "LR";
    if(quadrant === 5) quadLabel = "UR";
    if(quadrant === 6) quadLabel = "UL";
    if(quadrant === 7) quadLabel = "LL";
    if(quadrant === 8) quadLabel = "LR";
    if(!quadLabel) return String(fdi);
    if(isPrimaryFdi(fdi)){
      const letter = String.fromCharCode(65 + (position - 1));
      return `${quadLabel}-${letter}`;
    }
    return `${quadLabel}-${position}`;
  }

  return String(fdi);
}
