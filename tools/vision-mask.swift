// Détourage IA local avec le framework Vision de macOS (même moteur que « Détacher le sujet » dans Photos).
// Usage : swift tools/vision-mask.swift entree.png sortie-masque.png
// Écrit un masque en niveaux de gris (blanc = perso/effet, noir = fond), à la taille de l'image d'entrée.
import AppKit
import CoreImage
import Vision

let args = CommandLine.arguments
guard args.count >= 3 else {
  FileHandle.standardError.write("usage: vision-mask.swift in.png out.png\n".data(using: .utf8)!)
  exit(2)
}
let input = URL(fileURLWithPath: args[1]), output = URL(fileURLWithPath: args[2])
guard let ci = CIImage(contentsOf: input) else { exit(3) }

let handler = VNImageRequestHandler(ciImage: ci, options: [:])
let request = VNGenerateForegroundInstanceMaskRequest()
// Le Neural Engine échoue parfois à charger le modèle : on réessaie, puis on passe sur le CPU.
var done = false
for attempt in 0..<4 where !done {
  if attempt == 2, let cpu = (try? request.supportedComputeStageDevices)?[.main]?.first(where: { "\($0)".contains("CPU") }) {
    try? request.setComputeDevice(cpu, for: .main)
  }
  do {
    try handler.perform([request])
    done = true
  } catch {
    if attempt == 3 {
      FileHandle.standardError.write("vision: \(error)\n".data(using: .utf8)!)
      exit(4)
    }
    usleep(300_000)
  }
}

let ctx = CIContext()
var maskImage: CIImage
if let result = request.results?.first, !result.allInstances.isEmpty {
  let buf = try result.generateScaledMaskForImage(forInstances: result.allInstances, from: handler)
  maskImage = CIImage(cvPixelBuffer: buf)
} else {
  // rien de détecté : masque vide
  maskImage = CIImage(color: .black).cropped(to: ci.extent)
}
guard let cg = ctx.createCGImage(maskImage, from: ci.extent, format: .L8, colorSpace: CGColorSpaceCreateDeviceGray()) else { exit(5) }
let rep = NSBitmapImageRep(cgImage: cg)
guard let png = rep.representation(using: .png, properties: [:]) else { exit(6) }
try png.write(to: output)
