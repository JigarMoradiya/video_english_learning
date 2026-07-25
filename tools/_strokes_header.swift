import Foundation
import CoreGraphics

// Minimal stand-in for the app's LetterMode — the geometry only ever checks
// `mode == .uppercase`, so cases are all that's needed for the dump.
enum LetterMode { case uppercase, lowercase }
