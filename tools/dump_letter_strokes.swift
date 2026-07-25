import Foundation
import CoreGraphics

// Minimal stand-in for the app's LetterMode — the geometry only ever checks
// `mode == .uppercase`, so cases are all that's needed for the dump.
enum LetterMode { case uppercase, lowercase }
//
//  Enums.swift
//  Learn English
//
//  Created by Jigar Moradiya on 05/09/25.
//


enum StrokeSegment {
    case line(CGPoint)
    case quadCurve(to: CGPoint, control: CGPoint)
    case arc(center: CGPoint, radius: CGFloat, startAngle: CGFloat, endAngle: CGFloat, clockwise: Bool)
}

// MARK: - Letter Skeleton
enum LetterSkeleton {
    static let startY: CGFloat = 0.1
    static let endY: CGFloat = 0.9
    static let topWeight: CGFloat = 1
    static let middleWeight: CGFloat = 1
    static let bottomWeight: CGFloat = 1
    
    static let totalWeight = topWeight + middleWeight + bottomWeight
    static let span = endY - startY

    static let center12 = (line1 + line2) / 2
    static let center23 = (line2 + line3) / 2
    
    // this for Lowercase
    static let line1 = startY
    static let line2 = startY + (topWeight / totalWeight) * span
    static let line3 = line2 + (middleWeight / totalWeight) * span
    static let line4 = endY

    // Bottom weight depends on mode
    static func bottomWeight(for mode: LetterMode) -> CGFloat {
       mode == .uppercase ? 0 : bottomWeight
    }

    static func totalWeight(for mode: LetterMode) -> CGFloat {
       topWeight + middleWeight + bottomWeight(for: mode)
    }

    // MARK: - Computed line positions
    static func line1(for mode: LetterMode) -> CGFloat {
       startY
    }

    static func line2(for mode: LetterMode) -> CGFloat {
       mode == .uppercase ? (startY + endY)/2 : startY + (topWeight / totalWeight(for: mode)) * (endY - startY)
    }

    static func line3(for mode: LetterMode) -> CGFloat {
       mode == .uppercase ? endY : line2(for: mode) + (middleWeight / totalWeight(for: mode)) * (endY - startY)
    }

    static func line4(for mode: LetterMode) -> CGFloat {
       mode == .uppercase ? 0 : endY
    }

    // Optional midpoints
    static func center12(for mode: LetterMode) -> CGFloat {
       (line1(for: mode) + line2(for: mode)) / 2
    }

    static func center23(for mode: LetterMode) -> CGFloat {
       (line2(for: mode) + line3(for: mode)) / 2
    }

    static func strokes(for letter: Character,mode: LetterMode) -> [[StrokeSegment]] {
        switch letter {
        case "A": return aUppercase(mode)
        case "B": return bUppercase(mode)
        case "C": return cUppercase(mode)
        case "D": return dUppercase(mode)
        case "E": return eUppercase(mode)
        case "F": return fUppercase(mode)
        case "G": return gUppercase(mode)
        case "H": return hUppercase(mode)
        case "I": return iUppercase(mode)
        case "J": return jUppercase(mode)
        case "K": return kUppercase(mode)
        case "L": return lUppercase(mode)
        case "M": return mUppercase(mode)
        case "N": return nUppercase(mode)
        case "O": return oUppercase(mode)
        case "P": return pUppercase(mode)
        case "Q": return qUppercase(mode)
        case "R": return rUppercase(mode)
        case "S": return sUppercase(mode)
        case "T": return tUppercase(mode)
        case "U": return uUppercase(mode)
        case "V": return vUppercase(mode)
        case "W": return wUppercase(mode)
        case "X": return xUppercase(mode)
        case "Y": return yUppercase(mode)
        case "Z": return zUppercase(mode)
            
// ... other uppercase letters
        case "a": return aLowercase(mode)
        case "b": return bLowercase(mode)
        case "c": return cLowercase(mode)
        case "d": return dLowercase(mode)
        case "e": return eLowercase(mode)
        case "f": return fLowercase(mode)
        case "g": return gLowercase(mode)
        case "h": return hLowercase(mode)
        case "i": return iLowercase(mode)
        case "j": return jLowercase(mode)
        case "k": return kLowercase(mode)
        case "l": return lLowercase(mode)
        case "m": return mLowercase(mode)
        case "n": return nLowercase(mode)
        case "o": return oLowercase(mode)
        case "p": return pLowercase(mode)
        case "q": return qLowercase(mode)
        case "r": return rLowercase(mode)
        case "s": return sLowercase(mode)
        case "t": return tLowercase(mode)
        case "u": return uLowercase(mode)
        case "v": return vLowercase(mode)
        case "w": return wLowercase(mode)
        case "x": return xLowercase(mode)
        case "y": return yLowercase(mode)
        case "z": return zLowercase(mode)
        default: return aLowercase(mode)
        }
    }
    
        
    private static func aUppercase(_ mode: LetterMode) -> [[StrokeSegment]] {
        let line1 = line1(for: mode)
        let line2 = line2(for: mode)
        let line3 = line3(for: mode)
        return [
            [.line(CGPoint(x: 0.5, y: line1)), .line(CGPoint(x: 0.25, y: line3))],
            [.line(CGPoint(x: 0.5, y: line1)), .line(CGPoint(x: 0.75, y: line3))],
            [.line(CGPoint(x: 0.36, y: line2 + 0.05)), .line(CGPoint(x: 0.64, y: line2 + 0.05))]
        ]
    }
    
    private static func bUppercase(_ mode: LetterMode) -> [[StrokeSegment]] {
        let line1 = line1(for: mode)
        let line2 = line2(for: mode)
        let line3 = line3(for: mode)
        let center12 = center12(for: mode)
        let center23 = center23(for: mode)
        return [
           [.line(CGPoint(x: 0.4, y: line1)), .line(CGPoint(x: 0.4, y: line3))], // vertical line
           [.line(CGPoint(x: 0.4, y: line1)),
            .quadCurve(to: CGPoint(x: 0.7, y: center12), control: CGPoint(x: 0.7, y: line1)),
            .quadCurve(to: CGPoint(x: 0.4, y: line2), control: CGPoint(x: 0.7, y: line2))],
           [.line(CGPoint(x: 0.4, y: line2)),
            .quadCurve(to: CGPoint(x: 0.7, y: center23), control: CGPoint(x: 0.7, y: line2)),
            .quadCurve(to: CGPoint(x: 0.4, y: line3), control: CGPoint(x: 0.7, y: line3))]
       ]
    }
    
    private static func cUppercase(_ mode: LetterMode) -> [[StrokeSegment]] {
        let line1 = line1(for: mode)
        let line3 = line3(for: mode)
        
        let originalCenter = CGPoint(x: 0.5, y: 0.5)
        let originalRadius: CGFloat = 0.40

        // Map original Y (0.1–0.9) to line1–line3
        let scaleY: (CGFloat) -> CGFloat = { y in
            line1 + (y - startY) / (endY - startY) * (line3 - line1)
        }

        // Scale center Y and radius to fit between line1 and line3
        let newCenter = CGPoint(x: originalCenter.x, y: scaleY(originalCenter.y))
        let newRadius = originalRadius * (line3 - line1) / (endY - startY)

        // Keep the same sweep and angles
        let sweep = 0.7 * 2.0 * .pi
        let midAngle = CGFloat.pi
        let startAngle = midAngle - sweep / 2.0
        let endAngle = midAngle + sweep / 2.0

        let arc = arcForCircle(
            center: newCenter,
            radius: newRadius,
            startAngle: endAngle,
            endAngle: startAngle,
            clockwise: true,
            steps: 40
        )

        return [arc]
    }

    private static func dUppercase(_ mode: LetterMode) -> [[StrokeSegment]] {
        let line1 = line1(for: mode)
        let line2 = line2(for: mode)
        let line3 = line3(for: mode)
        return [
            [.line(CGPoint(x: 0.3, y: line1)), .line(CGPoint(x: 0.3, y: line3))],
            [.line(CGPoint(x: 0.3, y: line1)),
             .quadCurve(to: CGPoint(x: 0.75, y: line2), control: CGPoint(x: 0.75, y: line1)),
             .quadCurve(to: CGPoint(x: 0.3, y: line3), control: CGPoint(x: 0.75, y: line3))]
        ]
    }
    private static func eUppercase(_ mode: LetterMode) -> [[StrokeSegment]] {
        let line1 = line1(for: mode)
        let line2 = line2(for: mode)
        let line3 = line3(for: mode)
        return [
            [.line(CGPoint(x: 0.3, y: line1)), .line(CGPoint(x: 0.3, y: line3))], // vertical
            [.line(CGPoint(x: 0.3, y: line1)), .line(CGPoint(x: 0.7, y: line1))], // top horizontal
            [.line(CGPoint(x: 0.3, y: line2)), .line(CGPoint(x: 0.6, y: line2))], // middle horizontal
            [.line(CGPoint(x: 0.3, y: line3)), .line(CGPoint(x: 0.7, y: line3))]  // bottom horizontal
        ]
    }

    private static func fUppercase(_ mode: LetterMode) -> [[StrokeSegment]] {
        let line1 = line1(for: mode)
        let line2 = line2(for: mode)
        let line3 = line3(for: mode)
        return [
            [.line(CGPoint(x: 0.3, y: line1)), .line(CGPoint(x: 0.3, y: line3))], // vertical
            [.line(CGPoint(x: 0.3, y: line1)), .line(CGPoint(x: 0.7, y: line1))], // top horizontal
            [.line(CGPoint(x: 0.3, y: line2)), .line(CGPoint(x: 0.6, y: line2))]  // middle horizontal
        ]
    }

    
    private static func gUppercase(_ mode: LetterMode) -> [[StrokeSegment]] {
        let line1 = line1(for: mode)
        let line3 = line3(for: mode)
         
        // Original center and radius
        let originalCenter = CGPoint(x: 0.5, y: 0.5)
        let originalRadius: CGFloat = 0.40

        // Scale function for Y to fit line1 → line3
        let scaleY: (CGFloat) -> CGFloat = { y in
            line1 + (y - startY) / (endY - startY) * (line3 - line1)
        }

        // New center and radius
        let newCenter = CGPoint(x: originalCenter.x, y: scaleY(originalCenter.y))
        let newRadius = originalRadius * (line3 - line1) / (endY - startY)

        // Arc angles
        let startAngle: CGFloat = 5 * .pi / 4       // 225° (bottom-left)
        let endAngle: CGFloat = startAngle - (288.0 * .pi / 180.0) // clockwise 288°

        let arc = arcForCircle(center: newCenter,
                               radius: newRadius,
                               startAngle: startAngle,
                               endAngle: endAngle,
                               clockwise: true,
                               steps: 40)

        // Find the last point of the arc
        guard case let .line(lastPoint) = arc.last! else {
            return [arc]
        }

        // Compute angle of last point relative to center
        let dx = lastPoint.x - newCenter.x
        let dy = lastPoint.y - newCenter.y
        let currentAngle = atan2(dy, dx)

        // We want endpoint perfectly horizontal
        let desiredAngle: CGFloat = 0
        let rotation = desiredAngle - currentAngle

        // Rotate the entire arc
        let rotatedArc = rotate(stroke: arc, around: newCenter, by: rotation)

        // New last point
        guard case let .line(newEnd) = rotatedArc.last! else {
            return [rotatedArc]
        }

        // Horizontal line connecting to G end
        let horizontalLine: [StrokeSegment] = [
            .line(CGPoint(x: newEnd.x - 0.3, y: newEnd.y)),
            .line(newEnd)
        ]

        return [rotatedArc, horizontalLine]
    }

    
    private static func hUppercase(_ mode: LetterMode) -> [[StrokeSegment]] {
        let line1 = line1(for: mode)
        let line2 = line2(for: mode)
        let line3 = line3(for: mode)
        return [
            [.line(CGPoint(x: 0.3, y: line1)), .line(CGPoint(x: 0.3, y: line3))], // left vertical
            [.line(CGPoint(x: 0.7, y: line1)), .line(CGPoint(x: 0.7, y: line3))], // right vertical
            [.line(CGPoint(x: 0.3, y: line2)), .line(CGPoint(x: 0.7, y: line2))]  // middle horizontal
        ]
    }

    private static func iUppercase(_ mode: LetterMode) -> [[StrokeSegment]] {
        let line1 = line1(for: mode)
        let line3 = line3(for: mode)
        return [
            [.line(CGPoint(x: 0.5, y: line1)), .line(CGPoint(x: 0.5, y: line3))], // vertical
            [.line(CGPoint(x: 0.3, y: line1)), .line(CGPoint(x: 0.7, y: line1))], // top bar
            [.line(CGPoint(x: 0.3, y: line3)), .line(CGPoint(x: 0.7, y: line3))]  // bottom bar
        ]
    }
  

    private static func jUppercase(_ mode: LetterMode) -> [[StrokeSegment]] {
        let line1 = line1(for: mode)
        let line3 = line3(for: mode)
        
        let scaleY: (CGFloat) -> CGFloat = { y in
            line1 + (y - startY) / (endY - startY) * (line3 - line1)
        }

        // 1) Top horizontal bar
        let topBar: [StrokeSegment] = [
            .line(CGPoint(x: 0.3, y: scaleY(line1))),
            .line(CGPoint(x: 0.7, y: scaleY(line1)))
        ]

        // 2) Vertical stem stops slightly above line3 (leaving room for hook)
        let stemTop = CGPoint(x: 0.50, y: scaleY(line1))
        let stemBottom = CGPoint(x: 0.50, y: scaleY(line3 - 0.12 * (line3 - line1))) // smaller gap for hook
        let stem: [StrokeSegment] = [
            .line(stemTop),
            .line(stemBottom)
        ]

        // 3) Hook (arc) starts exactly at stemBottom
        let verticalSpace = line3 - stemBottom.y
        let hookRadius: CGFloat = verticalSpace // radius fits remaining space
        let hookCenter = CGPoint(x: stemBottom.x - hookRadius, y: stemBottom.y) // start from stemBottom
        let startAngle: CGFloat = 0.0
        let endAngle: CGFloat = CGFloat.pi * 0.8
        let hook = arcForCircle(center: hookCenter,
                                radius: hookRadius,
                                startAngle: startAngle,
                                endAngle: endAngle,
                                clockwise: false,
                                steps: 15)

        return [topBar, stem, hook]
    }

 
    private static func kUppercase(_ mode: LetterMode) -> [[StrokeSegment]] {
        let line1 = line1(for: mode)
        let line2 = line2(for: mode)
        let line3 = line3(for: mode)
        return [
            [.line(CGPoint(x: 0.3, y: line1)), .line(CGPoint(x: 0.3, y: line3))], // vertical
            [.line(CGPoint(x: 0.3, y: line2)), .line(CGPoint(x: 0.7, y: line1))], // diagonal up
            [.line(CGPoint(x: 0.3, y: line2)), .line(CGPoint(x: 0.7, y: line3))]  // diagonal down
        ]
    }

    private static func lUppercase(_ mode: LetterMode) -> [[StrokeSegment]] {
        let line1 = line1(for: mode)
        let line3 = line3(for: mode)
        return  [
            [.line(CGPoint(x: 0.3, y: line1)), .line(CGPoint(x: 0.3, y: line3))], // vertical
            [.line(CGPoint(x: 0.3, y: line3)), .line(CGPoint(x: 0.7, y: line3))]  // bottom horizontal
        ]
    }
    private static func mUppercase(_ mode: LetterMode) -> [[StrokeSegment]] {
        let line1 = line1(for: mode)
        let line2 = line2(for: mode)
        let line3 = line3(for: mode)
        return [
            [.line(CGPoint(x: 0.25, y: line1)), .line(CGPoint(x: 0.25, y: line3))], // left vertical
            [.line(CGPoint(x: 0.25, y: line1)), .line(CGPoint(x: 0.5, y: line2))], // left diagonal
            [.line(CGPoint(x: 0.5, y: line2)), .line(CGPoint(x: 0.75, y: line1))], // right diagonal
            [.line(CGPoint(x: 0.75, y: line1)), .line(CGPoint(x: 0.75, y: line3))]  // right vertical
        ]
    }

    private static func nUppercase(_ mode: LetterMode) -> [[StrokeSegment]] {
        let line1 = line1(for: mode)
        let line3 = line3(for: mode)
        return  [
            [.line(CGPoint(x: 0.3, y: line1)), .line(CGPoint(x: 0.3, y: line3))], // left vertical
            [.line(CGPoint(x: 0.3, y: line1)), .line(CGPoint(x: 0.7, y: line3))], // diagonal
            [.line(CGPoint(x: 0.7, y: line3)), .line(CGPoint(x: 0.7, y: line1))]  // right vertical
        ]
    }

    // --- O ---
    private static func oUppercase(_ mode: LetterMode) -> [[StrokeSegment]] {
        let line1 = line1(for: mode)
        let line3 = line3(for: mode)
        
        let center = CGPoint(x: 0.5, y: (line1 + line3) / 2)       // vertical center
        let radius: CGFloat = (line3 - line1) / 2                  // radius to fit between line1 & line3
        let circle = arcForCircle(
            center: center,
            radius: radius,
            startAngle: 3 * CGFloat.pi / 2,// full circle clockwise
            endAngle: -CGFloat.pi / 2,   // start at top (90°)
            clockwise: true,
            steps: 50
        )
        return [circle]
    }


    // --- P ---
    private static func pUppercase(_ mode: LetterMode) -> [[StrokeSegment]] {
        let line1 = line1(for: mode)
        let line2 = line2(for: mode)
        let line3 = line3(for: mode)
        let center12 = center12(for: mode)
        
        // Left vertical stem
        let vertical: [StrokeSegment] = [
            .line(CGPoint(x: 0.35, y: line1)),
            .line(CGPoint(x: 0.35, y: line3))
        ]

        // Bowl of P (connects from top-left to mid-left)
        let bowl: [StrokeSegment] = [
            .line(CGPoint(x: 0.35, y: line1)),                                   // start at top-left
            .quadCurve(to: CGPoint(x: 0.7, y: center12), control: CGPoint(x: 0.7, y: line1)), // top curve
            .quadCurve(to: CGPoint(x: 0.35, y: line2), control: CGPoint(x: 0.7, y: line2))  // bottom curve of bowl
        ]

        return [vertical, bowl]
    }


    // --- Q ---
    private static func qUppercase(_ mode: LetterMode) -> [[StrokeSegment]] {
        let line1 = line1(for: mode)
        let line2 = line2(for: mode)
        let line3 = line3(for: mode)
        
        let center = CGPoint(x: 0.5, y: (line1 + line3) / 2) // y = 0.5
        let radius: CGFloat = (line3 - line1) / 2             // radius = 0.4
        let circle = arcForCircle(
            center: center,
            radius: radius,
            startAngle: 3 * CGFloat.pi / 2,// full circle clockwise
            endAngle: -CGFloat.pi / 2,   // start at top (90°)
            clockwise: true,
            steps: 50
        )
        // little tail on bottom-right
        let tail: [StrokeSegment] = [
            .line(CGPoint(x: 0.65, y: line2 + 0.06)),
            .line(CGPoint(x: 0.8, y: line3 - 0.06))
        ]
        return [circle, tail]
    }

    // --- R ---
    private static func rUppercase(_ mode: LetterMode) -> [[StrokeSegment]] {
        let line1 = line1(for: mode)
        let line2 = line2(for: mode)
        let line3 = line3(for: mode)
        let center12 = center12(for: mode)
        
        let vertical: [StrokeSegment] = [
            .line(CGPoint(x: 0.35, y: line1)),
            .line(CGPoint(x: 0.35, y: line3))
        ]
        // Bowl of P (connects from top-left to mid-left)
        let bowl: [StrokeSegment] = [
            .line(CGPoint(x: 0.35, y: line1)),                                   // start at top-left
            .quadCurve(to: CGPoint(x: 0.7, y: center12), control: CGPoint(x: 0.7, y: line1)), // top curve
            .quadCurve(to: CGPoint(x: 0.35, y: line2), control: CGPoint(x: 0.7, y: line2))  // bottom curve of bowl
        ]
        let diagonal: [StrokeSegment] = [
            .line(CGPoint(x: 0.35, y: line2)),
            .line(CGPoint(x: 0.7, y: line3))
        ]
        return [vertical, bowl, diagonal]
    }

    private static func sUppercase(_ mode: LetterMode) -> [[StrokeSegment]] {
        let line1 = line1(for: mode) - 0.01
        let line2 = line2(for: mode)
        let line3 = line3(for: mode)
        let sweep: CGFloat = 0.57 * 2 * .pi // ~60% of a circle

        let topY = line1
        let middleY = line2
        let bottomY = line3

        // Top Arc (open right)
        let radiusTop = (middleY - topY) / 2
        let centerTop = CGPoint(x: 0.5, y: topY + radiusTop)
        
        let midAngleTop = CGFloat.pi
        let startAngleTop = midAngleTop - sweep / 2
        let endAngleTop   = midAngleTop + sweep / 2

        let topArc = arcForCircle(center: centerTop,
                                  radius: radiusTop,
                                  startAngle: endAngleTop,
                                  endAngle: startAngleTop,
                                  clockwise: true,
                                  steps: 30)

        guard case let .line(topEnd) = topArc.last! else { return [] }

        // Bottom Arc (open left)
        let radiusBottom = (bottomY - middleY) / 2
        let centerBottom = CGPoint(x: 0.5, y: middleY + radiusBottom)

        let midAngleBottom: CGFloat = 0
        let startAngleBottom = midAngleBottom - sweep / 2
        let endAngleBottom   = midAngleBottom + sweep / 2
 
        var bottomArc = arcForCircle(center: centerBottom,
                                     radius: radiusBottom,
                                     startAngle: startAngleBottom,
                                     endAngle: endAngleBottom,
                                     clockwise: false,
                                     steps: 30)

        // Snap bottom arc start to top arc end
        if case .line(let firstPoint) = bottomArc.first! {
            let dx = topEnd.x - firstPoint.x
            let dy = topEnd.y - firstPoint.y
            bottomArc = bottomArc.map { seg in
                if case .line(let pt) = seg {
                    return .line(CGPoint(x: pt.x + dx, y: pt.y + dy))
                }
                return seg
            }
        }

        // Optional: slight rotation
        let rotationCenter = CGPoint(x: 0.5, y: (topY + bottomY)/2)
        let rotationAngle: CGFloat = .pi / 7
        let rotatedTop = rotate(stroke: topArc, around: rotationCenter, by: rotationAngle)
        let rotatedBottom = rotate(stroke: bottomArc, around: rotationCenter, by: rotationAngle)

        return [rotatedTop, rotatedBottom]
    }


    
    // --- T ---
    private static func tUppercase(_ mode: LetterMode) -> [[StrokeSegment]] {
        let line1 = line1(for: mode)
        let line3 = line3(for: mode)
        
        let horizontal: [StrokeSegment] = [
            .line(CGPoint(x: 0.25, y: line1)),
            .line(CGPoint(x: 0.75, y: line1))
        ]
        let vertical: [StrokeSegment] = [
            .line(CGPoint(x: 0.5, y: line1)),
            .line(CGPoint(x: 0.5, y: line3))
        ]
        return [horizontal, vertical]
    }
    
    // --- U uppercase with connected lines and arc ---
    private static func uUppercase(_ mode: LetterMode) -> [[StrokeSegment]] {
        let line1 = line1(for: mode)
        let line3 = line3(for: mode)
        
        // Arc parameters
        let arcRadius: CGFloat = 0.2
        let arcCenterY = line3 - arcRadius

        // Generate bottom arc first
        let bottomArc = arcForCircle(
            center: CGPoint(x: 0.5, y: arcCenterY),
            radius: arcRadius,
            startAngle: .pi,   // left
            endAngle: 0,       // right
            clockwise: true,
            steps: 25
        )

        // Get exact X positions of arc start and end
        guard case let .line(leftArcStart) = bottomArc.first!,
              case let .line(rightArcEnd) = bottomArc.last! else {
            return []
        }

        // Vertical lines aligned to arc
        let leftVertical: [StrokeSegment] = [
            .line(CGPoint(x: leftArcStart.x, y: line1)),
            .line(leftArcStart)
        ]

        let rightVertical: [StrokeSegment] = [
            .line(rightArcEnd),
            .line(CGPoint(x: rightArcEnd.x, y: line1))
        ]

        return [leftVertical, bottomArc, rightVertical]
    }
        
    // --- V ---
    private static func vUppercase(_ mode: LetterMode) -> [[StrokeSegment]] {
        let line1 = line1(for: mode)
        let line3 = line3(for: mode)
    
        let leftLine: [StrokeSegment] = [
            .line(CGPoint(x: 0.25, y: line1)),
            .line(CGPoint(x: 0.5, y: line3))
        ]
        let rightLine: [StrokeSegment] = [
            .line(CGPoint(x: 0.5, y: line3)),
            .line(CGPoint(x: 0.7, y: line1))
        ]
        return [leftLine, rightLine]
    }

    // --- W ---
    private static func wUppercase(_ mode: LetterMode) -> [[StrokeSegment]] {
        let line1 = line1(for: mode)
        let line3 = line3(for: mode)
        
        let leftUp: [StrokeSegment] = [
            .line(CGPoint(x: 0.15, y: line1)),  // moved further left
            .line(CGPoint(x: 0.35, y: line3))
        ]
        let leftDown: [StrokeSegment] = [
            .line(CGPoint(x: 0.35, y: line3)),
            .line(CGPoint(x: 0.5, y: line1))
        ]
        let rightUp: [StrokeSegment] = [
            .line(CGPoint(x: 0.5, y: line1)),
            .line(CGPoint(x: 0.65, y: line3))
        ]
        let rightDown: [StrokeSegment] = [
            .line(CGPoint(x: 0.65, y: line3)),
            .line(CGPoint(x: 0.85, y: line1))   // moved further right
        ]
        return [leftUp, leftDown, rightUp, rightDown]
    }


    // --- X ---
    private static func xUppercase(_ mode: LetterMode) -> [[StrokeSegment]] {
        let line1 = line1(for: mode)
        let line3 = line3(for: mode)
        
        let diagonal1: [StrokeSegment] = [
            .line(CGPoint(x: 0.3, y: line1)),
            .line(CGPoint(x: 0.7, y: line3))
        ]
        let diagonal2: [StrokeSegment] = [
            .line(CGPoint(x: 0.7, y: line1)),
            .line(CGPoint(x: 0.3, y: line3))
        ]
        return [diagonal1, diagonal2]
    }

    // --- Y ---
    private static func yUppercase(_ mode: LetterMode) -> [[StrokeSegment]] {
        let line1 = line1(for: mode)
        let line2 = line2(for: mode)
        let line3 = line3(for: mode)
        
        // Top left diagonal
        let leftDiagonal: [StrokeSegment] = [
            .line(CGPoint(x: 0.3, y: line1)),  // top left
            .line(CGPoint(x: 0.5, y: line2))    // center of V
        ]
        
        // Top right diagonal
        let rightDiagonal: [StrokeSegment] = [
            .line(CGPoint(x: 0.7, y: line1)),  // top right
            .line(CGPoint(x: 0.5, y: line2))    // center of V
        ]
        
        // Vertical line from center down
        let verticalLine: [StrokeSegment] = [
            .line(CGPoint(x: 0.5, y: line2)),   // center of V
            .line(CGPoint(x: 0.5, y: line3))     // bottom
        ]
        
        return [leftDiagonal, rightDiagonal, verticalLine]
    }


    // --- Z ---
    private static func zUppercase(_ mode: LetterMode) -> [[StrokeSegment]] {
        let line1 = line1(for: mode)
        let line3 = line3(for: mode)
        
        let topLine: [StrokeSegment] = [
            .line(CGPoint(x: 0.3, y: line1)),  // moved up
            .line(CGPoint(x: 0.7, y: line1))
        ]
            
        let diagonalLine: [StrokeSegment] = [
            .line(CGPoint(x: 0.7, y: line1)),  // moved down
            .line(CGPoint(x: 0.3, y: line3))
        ]
        let bottomLine: [StrokeSegment] = [
            .line(CGPoint(x: 0.3, y: line3)),  // moved down
            .line(CGPoint(x: 0.7, y: line3))
        ]
        return [topLine, diagonalLine, bottomLine]
    }



    // MARK: - Arc helper
    private static func arcForCircle(center: CGPoint,
                                 radius: CGFloat,
                                 startAngle: CGFloat,
                                 endAngle: CGFloat,
                                 clockwise: Bool,
                                 steps: Int) -> [StrokeSegment] {
      var points: [StrokeSegment] = []
      for i in 0...steps {
          let t = CGFloat(i) / CGFloat(steps)
          let angle = startAngle + (endAngle - startAngle) * t
          let x = center.x + radius * cos(angle)
          let y = center.y + radius * sin(angle)
          points.append(.line(CGPoint(x: x, y: y)))
      }
      return points
    }
    
    private static func quadCurveForPoints(start: CGPoint, end: CGPoint, control: CGPoint, steps: Int) -> [StrokeSegment] {
        var result: [StrokeSegment] = []
        for i in 0...steps {
            let t = CGFloat(i) / CGFloat(steps)
            let oneMinusT = 1 - t
            let x = oneMinusT * oneMinusT * start.x +
                    2 * oneMinusT * t * control.x +
                    t * t * end.x
            let y = oneMinusT * oneMinusT * start.y +
                    2 * oneMinusT * t * control.y +
                    t * t * end.y
            result.append(.line(CGPoint(x: x, y: y)))
        }
        return result
    }


    
    private static func rotate(stroke: [StrokeSegment], around center: CGPoint, by angle: CGFloat) -> [StrokeSegment] {
        stroke.map { seg in
            switch seg {
            case .line(let pt):
                return .line(pt.rotated(around: center, by: angle))
            case .quadCurve(let to, let control):
                return .quadCurve(to: to.rotated(around: center, by: angle),
                                  control: control.rotated(around: center, by: angle))
            case .arc(let centerPoint, let radius, let startAngle, let endAngle, let clockwise):
                   // Rotate the center point
               let newCenter = centerPoint.rotated(around: center, by: angle)
               // Rotate start and end angles
               let newStart = startAngle + angle
               let newEnd = endAngle + angle
               return .arc(center: newCenter, radius: radius, startAngle: newStart, endAngle: newEnd, clockwise: clockwise)
            
            }
        }
    }

    
    // -----------------------------
    // Example lowercase letters
    // -----------------------------

    // --- a ---
    private static func aLowercase(_ mode: LetterMode) -> [[StrokeSegment]] {
        let line2 = line2(for: mode)
        let line3 = line3(for: mode)
        
        // Circle part
        let center = CGPoint(x: 0.45, y: (line2 + line3) / 2)  // vertical center between line2 & line3
        let radiusX: CGFloat = 0.15                             // horizontal radius
        let radiusY: CGFloat = (line3 - line2) / 2             // vertical radius fits exactly between line2 & line3
        let steps = 30
        var circleSegments: [StrokeSegment] = []

        // Adjust start angle slightly clockwise from top
        let startAngleOffset: CGFloat = CGFloat.pi / 4  // ~45 degrees
        for i in 0...steps {
            let t = CGFloat(i)/CGFloat(steps)
            let angle = -CGFloat.pi/2 + startAngleOffset - 2 * CGFloat.pi * t  // start slightly right from top, anticlockwise
            let x = center.x + radiusX * cos(angle)
            let y = center.y + radiusY * sin(angle)
            circleSegments.append(.line(CGPoint(x: x, y: y)))
        }

        // Right vertical line touching rightmost point of circle
        let rightLineStart = CGPoint(x: center.x + radiusX, y: center.y - radiusY)       // top-right of circle
        let rightLineEnd = CGPoint(x: center.x + radiusX, y: center.y + radiusY)         // bottom-right of circle
        let verticalLine: [StrokeSegment] = [
            .line(rightLineStart),
            .line(rightLineEnd)
        ]

        return [circleSegments, verticalLine]
    }

    
    // b and d
    private static func lowercaseStemArcLetter(_ topY: CGFloat,
                                               _ midY: CGFloat,
                                               _ bottomY: CGFloat,
                                               _ flipHorizontally: Bool
    ) -> [[StrokeSegment]] {
        
        // Circle/arc part
        let centerX: CGFloat = 0.5
        let centerY = (midY + bottomY) / 2
        let radiusY = (bottomY - midY) / 2
        let radiusX = radiusY * 0.9

        let sweep = 0.7 * 2.0 * .pi
        let midAngle = CGFloat.pi
        let startAngle = midAngle - sweep / 2.0
        let endAngle = midAngle + sweep / 2.0

        var arc = arcForCircle(center: CGPoint(x: centerX, y: centerY),
                               radius: radiusX,
                               startAngle: endAngle,
                               endAngle: startAngle,
                               clockwise: true,
                               steps: 25)

        // Adjust Y scale for ellipse shape
        arc = arc.map { seg in
            switch seg {
            case .line(let pt):
                let scaledY = (pt.y - centerY) * (radiusY / radiusX) + centerY
                let x = flipHorizontally ? 1.0 - pt.x : pt.x
                return .line(CGPoint(x: x, y: scaledY))
            default: return seg
            }
        }

        // Determine stem X position
        let stemX = arc.last.flatMap { seg -> CGFloat? in
            if case let .line(pt) = seg { return pt.x }
            return nil
        } ?? (flipHorizontally ? centerX - radiusX : centerX + radiusX)

        // Vertical stem from topY to bottomY
        let verticalLine: [StrokeSegment] = [
            .line(CGPoint(x: stemX, y: topY)),
            .line(CGPoint(x: stemX, y: bottomY))
        ]

        return flipHorizontally ? [verticalLine, arc] : [arc, verticalLine]
    }
    private static func bLowercase(_ mode: LetterMode) -> [[StrokeSegment]] {
        let line1 = line1(for: mode)
        let line2 = line2(for: mode)
        let line3 = line3(for: mode)
        return lowercaseStemArcLetter(line1,line2,line3,true)
    }
    private static func dLowercase(_ mode: LetterMode) -> [[StrokeSegment]] {
        let line1 = line1(for: mode)
        let line2 = line2(for: mode)
        let line3 = line3(for: mode)
        return lowercaseStemArcLetter(line1,line2,line3,false)
    }
    
    private static func cLowercase(_ mode: LetterMode) -> [[StrokeSegment]] {
        let line2 = line2(for: mode)
        let line3 = line3(for: mode)

        // Circle/arc part
        let centerX: CGFloat = 0.5
        let centerY = (line2 + line3) / 2
        let radiusY = (line3 - line2) / 2
        let radiusX = radiusY * 0.9

        let sweep = 0.7 * 2.0 * .pi
        let midAngle = CGFloat.pi
        let startAngle = midAngle - sweep / 2.0
        let endAngle = midAngle + sweep / 2.0

        var arc = arcForCircle(center: CGPoint(x: centerX, y: centerY),
                               radius: radiusX,
                               startAngle: endAngle,
                               endAngle: startAngle,
                               clockwise: true,
                               steps: 25)

        // Adjust Y scale for ellipse shape
        arc = arc.map { seg in
            switch seg {
            case .line(let pt):
                let scaledY = (pt.y - centerY) * (radiusY / radiusX) + centerY
                let x = pt.x
                return .line(CGPoint(x: x, y: scaledY))
            default: return seg
            }
        }
        return [arc]
    }


    private static func eLowercase(_ mode: LetterMode) -> [[StrokeSegment]] {
        let line2 = line2(for: mode)
        let line3 = line3(for: mode)
        
        let topY: CGFloat = line2
        let bottomY: CGFloat = line3
        let centerX: CGFloat = center23
        let centerY = (topY + bottomY) / 2
        let radiusY = (bottomY - topY) / 2
        let radiusX = radiusY * line3
        
        let steps = 50
        var arcSegments: [StrokeSegment] = []

        // Arc: start from 0° (right) anticlockwise to -288° (80% of circle)
        let sweepAngle = 2 * CGFloat.pi * 0.85 // 80% circle
        for i in 0...steps {
            let t = CGFloat(i)/CGFloat(steps)
            let angle = 0 - sweepAngle * t  // 0 -> -288°
            let x = centerX + radiusX * cos(angle)
            let y = centerY + radiusY * sin(angle)
            arcSegments.append(.line(CGPoint(x: x, y: y)))
        }

        // Horizontal line from rightmost point to the leftmost edge of circle
        let rightMostPoint = arcSegments.first.flatMap { seg -> CGPoint? in
            if case let .line(pt) = seg { return pt }
            return nil
        } ?? CGPoint(x: centerX + radiusX, y: centerY)
        
        let leftMostPoint = CGPoint(x: centerX - radiusX, y: rightMostPoint.y)
        
        let horizontalLine: [StrokeSegment] = [
            .line(leftMostPoint),
            .line(rightMostPoint)
            
        ]

        return [horizontalLine,arcSegments]
    }
    
    // --- f ---
    private static func fLowercase(_ mode: LetterMode) -> [[StrokeSegment]] {
        let line1 = line1(for: mode)
        let line3 = line3(for: mode)
        
        
        let lineStart = line1   // top line
        let lineEnd   = line3   // bottom line

        // 1) Vertical stem
        let hookHeightRatio: CGFloat = 0.2           // hook is 20% of stem height
        let stemTopY = lineStart + hookHeightRatio * (lineEnd - lineStart)
        let stemBottomY = lineEnd
        let stem: [StrokeSegment] = [
            .line(CGPoint(x: 0.5, y: stemTopY)),
            .line(CGPoint(x: 0.5, y: stemBottomY))
        ]

        // 2) Hook on top (anticlockwise) fully inside line1 → line3
        let hookRadius = hookHeightRatio * (lineEnd - lineStart)
        let hookCenter = CGPoint(x: 0.5 + hookRadius, y: stemTopY)
        let startAngle: CGFloat = CGFloat.pi         // left of hook
        let endAngle: CGFloat = CGFloat.pi * 1.7    // anticlockwise to right
        let hook = arcForCircle(center: hookCenter,
                                radius: hookRadius,
                                startAngle: endAngle,
                                endAngle: startAngle,
                                clockwise: false,
                                steps: 20)

        // 3) Horizontal line at middle of stem
        let horizontal: [StrokeSegment] = [
            .line(CGPoint(x: 0.40, y: center12)),
            .line(CGPoint(x: 0.62, y: center12))
        ]

        return [hook, stem, horizontal]
    }

    // --- g (curved hook like classic g, circle traced clockwise) ---
    private static func gLowercase(_ mode: LetterMode) -> [[StrokeSegment]] {
        let line2 = line2(for: mode)
        let line3 = line3(for: mode)
        let line4 = line4(for: mode)
        
        let lineTopCircle = line2    // 0.5
        let lineBottomCircle = line3 // 0.7
        let lineBottomTail = line4   // 0.9

        let centerX: CGFloat = 0.5
        let centerY = (lineTopCircle + lineBottomCircle) / 2
        let radiusY = (lineBottomCircle - lineTopCircle) / 2
        let radiusX = radiusY * 0.9

        // --- Circle (top part of g) traced clockwise from 45° ---
        let circleSteps = 30
        var circle: [StrokeSegment] = []

        // 45° = π/4 radians (top-right)
        let startAngle = -CGFloat.pi / 4
        let sweepAngle = 2 * CGFloat.pi  // full circle sweep, can reduce if you want 75%

        for i in 0...circleSteps {
            let t = CGFloat(i) / CGFloat(circleSteps)
            // clockwise: subtract sweep
            let angle = startAngle - sweepAngle * t
            let x = centerX + radiusX * cos(angle)
            let y = centerY + radiusY * sin(angle)
            circle.append(.line(CGPoint(x: x, y: y)))
        }


        // --- Vertical stem ---
        let stemTop = CGPoint(x: centerX + radiusX, y: lineTopCircle)      // start at top of circle
        let stemBottom = CGPoint(x: stemTop.x, y: lineBottomTail - 0.08)   // leave space for hook
        let stem: [StrokeSegment] = [
            .line(stemTop),
            .line(stemBottom)
        ]

        // --- Curved hook ---
        let hookRadius: CGFloat = 0.08      // bigger radius for more curve
        let hookCenter = CGPoint(x: stemBottom.x - hookRadius, y: stemBottom.y)
        let startAngle1: CGFloat = 0.0
        let endAngle: CGFloat = CGFloat.pi * 0.8   // more sweep for deeper hook

        let hook = arcForCircle(center: hookCenter,
                                radius: hookRadius,
                                startAngle: startAngle1,
                                endAngle: endAngle,
                                clockwise: false,
                                steps: 15)

        return [circle, stem, hook]
    }
   
    private static func hLowercase(_ mode: LetterMode) -> [[StrokeSegment]] {
        let line1 = line1(for: mode)
        let line2 = line2(for: mode)
        let line3 = line3(for: mode)
        
        
        let topY = line1
        let midY = line2         // horizontal line starts at line2
        let bottomY = line3

        let leftX: CGFloat = 0.36
        let rightX: CGFloat = 0.64
        let horizontalY = midY

        // 1) Left vertical
        let leftVertical: [StrokeSegment] = [
            .line(CGPoint(x: leftX, y: topY)),
            .line(CGPoint(x: leftX, y: bottomY))
        ]

        // 2) Horizontal connector line starting at line2
        let horizontalLine: [StrokeSegment] = [
            .line(CGPoint(x: leftX, y: horizontalY)),
            .line(CGPoint(x: rightX - 0.05, y: horizontalY)) // leave small space for arc
        ]

        // 3) Arc to connect horizontal to right vertical
        let arcRadius: CGFloat = 0.05
        let arcCenter = CGPoint(x: rightX - arcRadius, y: horizontalY + arcRadius)
        let startAngle: CGFloat = -CGFloat.pi / 2 // start at horizontal line end
        let endAngle: CGFloat = 0                  // end at right vertical start
        let arc = arcForCircle(center: arcCenter,
                               radius: arcRadius,
                               startAngle: startAngle,
                               endAngle: endAngle,
                               clockwise: true,
                               steps: 10)

        // 4) Right vertical (start from arc end)
        let rightVerticalStart = arc.last.flatMap { seg -> CGPoint? in
            if case let .line(pt) = seg { return pt }
            return nil
        } ?? CGPoint(x: rightX, y: midY)

        let rightVertical: [StrokeSegment] = [
            .line(rightVerticalStart),
            .line(CGPoint(x: rightX, y: bottomY))
        ]

        return [leftVertical, horizontalLine, arc, rightVertical]
    }


    // --- i ---
    private static func iLowercase(_ mode: LetterMode) -> [[StrokeSegment]] {
        let line2 = line2(for: mode)
        let line3 = line3(for: mode)
        
        return [
            [.line(CGPoint(x: 0.5, y: line2)),.line(CGPoint(x: 0.5, y: line3))],
            [.line(CGPoint(x: 0.5, y: line2 - 0.05)),.line(CGPoint(x: 0.5, y: line2 - 0.05))] // dot
        ]
    }

    // --- j ---
    private static func jLowercase(_ mode: LetterMode) -> [[StrokeSegment]] {
        let line2 = line2(for: mode)
        let line4 = line4(for: mode)
                
        let lineStart = line2   // 0.5
        let lineEnd   = line4   // 0.9

        let startY: CGFloat = 0.1
        let endY: CGFloat = 0.7

        // Scale function for Y
        let scaleY: (CGFloat) -> CGFloat = { y in
            lineStart + (y - startY) / (endY - startY) * (lineEnd - lineStart)
        }

        // 1) Top Dot
        let topBar: [StrokeSegment] =  [
            .line(CGPoint(x: 0.5, y: line2 - 0.05)), // dot
            .line(CGPoint(x: 0.5, y: line2 - 0.05))
        ]
        

        // 2) Vertical stem
        let stemTop = CGPoint(x: 0.50, y: scaleY(startY))
        // Hook should not exceed lineEnd, so stemBottom stops before lineEnd
        let hookRadius: CGFloat = (lineEnd - lineStart) * 0.2   // max 20% of height
        let stemBottom = CGPoint(x: 0.50, y: lineEnd - hookRadius)
        let stem: [StrokeSegment] = [
            .line(stemTop),
            .line(stemBottom)
        ]

        // 3) Hook (small arc) at bottom
        let center = CGPoint(x: stemBottom.x - hookRadius, y: stemBottom.y)
        let startAngle: CGFloat = 0.0
        let endAngle: CGFloat = CGFloat.pi * 0.7  // ~126°

        let hook = arcForCircle(center: center,
                                radius: hookRadius,
                                startAngle: startAngle,
                                endAngle: endAngle,
                                clockwise: false,
                                steps: 15)

        return [stem, hook, topBar]
    }



    // --- k ---
    private static func kLowercase(_ mode: LetterMode) -> [[StrokeSegment]] {
        let line1 = line1(for: mode)
        let line2 = line2(for: mode)
        let line3 = line3(for: mode)
        
        return [
            [
                .line(CGPoint(x: 0.4, y: line1)),
                .line(CGPoint(x: 0.4, y: line3))
            ],
            [
                .line(CGPoint(x: 0.4, y: center23)),
                .line(CGPoint(x: 0.6, y: line2))
            ],
            [
                .line(CGPoint(x: 0.4, y: center23)),
                .line(CGPoint(x: 0.6, y: line3))
            ]
        ]
    }

    // --- l ---
    private static func lLowercase(_ mode: LetterMode) -> [[StrokeSegment]] {
        let line1 = line1(for: mode)
        let line3 = line3(for: mode)
        
        return [
            [
                .line(CGPoint(x: 0.5, y: line1)),
                .line(CGPoint(x: 0.5, y: line3))
            ]
        ]
    }

    
    private static func mLowercase(_ mode: LetterMode) -> [[StrokeSegment]] {
        let line2 = line2(for: mode)
        let line3 = line3(for: mode)

        let topY = line2
        let bottomY = line3

        let leftX: CGFloat = 0.3
        let middleX: CGFloat = 0.5
        let rightX: CGFloat = 0.7
        let horizontalY = topY

        // 1) Left vertical
        let leftVertical: [StrokeSegment] = [
            .line(CGPoint(x: leftX, y: topY - 0.02)),
            .line(CGPoint(x: leftX, y: bottomY))
        ]

        // 2) First horizontal line (left → middle)
        let horizontal1EndX = middleX - 0.05
        let horizontalLine1: [StrokeSegment] = [
            .line(CGPoint(x: leftX, y: horizontalY)),
            .line(CGPoint(x: horizontal1EndX, y: horizontalY))
        ]

        // 3) First arc connecting to middle vertical
        let arcRadius: CGFloat = 0.05
        let arcCenter1 = CGPoint(x: horizontal1EndX, y: horizontalY + arcRadius)
        let arc1 = arcForCircle(center: arcCenter1,
                                radius: arcRadius,
                                startAngle: -CGFloat.pi / 2,
                                endAngle: 0,
                                clockwise: true,
                                steps: 10)

        // 4) Middle vertical
        let middleVerticalStart = arc1.last.flatMap { seg -> CGPoint? in
            if case let .line(pt) = seg { return pt }
            return nil
        } ?? CGPoint(x: middleX, y: topY)

        let middleVertical: [StrokeSegment] = [
            .line(middleVerticalStart),
            .line(CGPoint(x: middleX, y: bottomY))
        ]

        // 5) Second arc (mirror of arc1, flipped horizontally)
        let arcCenter2 = CGPoint(x: middleX + 0.05, y: horizontalY + arcRadius)
        let arc2 = arcForCircle(center: arcCenter2,
                                radius: arcRadius,
                                startAngle: -CGFloat.pi,    // flip horizontally
                                endAngle: -CGFloat.pi / 2,
                                clockwise: true,
                                steps: 10)

        // 6) Second horizontal line (middle → right)
        let horizontalLine2StartX = arc2.last.flatMap { seg -> CGFloat? in
            if case let .line(pt) = seg { return pt.x }
            return nil
        } ?? (middleX + 0.05)

        let horizontalLine2: [StrokeSegment] = [
            .line(CGPoint(x: horizontalLine2StartX, y: horizontalY)),
            .line(CGPoint(x: rightX - 0.05, y: horizontalY))
        ]

        // 7) Third arc connecting horizontal2 to right vertical
        let arcCenter3 = CGPoint(x: rightX - 0.05, y: horizontalY + arcRadius)
        let arc3 = arcForCircle(center: arcCenter3,
                                radius: arcRadius,
                                startAngle: -CGFloat.pi / 2,
                                endAngle: 0,
                                clockwise: true,
                                steps: 10)

        // 8) Right vertical
        let rightVerticalStart = arc3.last.flatMap { seg -> CGPoint? in
            if case let .line(pt) = seg { return pt }
            return nil
        } ?? CGPoint(x: rightX, y: topY)

        let rightVertical: [StrokeSegment] = [
            .line(rightVerticalStart),
            .line(CGPoint(x: rightX, y: bottomY))
        ]

        return [leftVertical, horizontalLine1, arc1, middleVertical, arc2, horizontalLine2, arc3, rightVertical]
    }



    private static func nLowercase(_ mode: LetterMode) -> [[StrokeSegment]] {
        let line2 = line2(for: mode)
        let line3 = line3(for: mode)
        
        let topY = line2
        let midY = line2         // horizontal line starts at line2
        let bottomY = line3

        let leftX: CGFloat = 0.37
        let rightX: CGFloat = 0.63
        let horizontalY = midY

        // 1) Left vertical
        let leftVertical: [StrokeSegment] = [
            .line(CGPoint(x: leftX, y: topY - 0.02)),
            .line(CGPoint(x: leftX, y: bottomY))
        ]

        // 2) Horizontal connector line starting at line2
        let horizontalLine: [StrokeSegment] = [
            .line(CGPoint(x: leftX, y: horizontalY)),
            .line(CGPoint(x: rightX - 0.05, y: horizontalY)) // leave small space for arc
        ]

        // 3) Arc to connect horizontal to right vertical
        let arcRadius: CGFloat = 0.05
        let arcCenter = CGPoint(x: rightX - arcRadius, y: horizontalY + arcRadius)
        let startAngle: CGFloat = -CGFloat.pi / 2 // start at horizontal line end
        let endAngle: CGFloat = 0                  // end at right vertical start
        let arc = arcForCircle(center: arcCenter,
                               radius: arcRadius,
                               startAngle: startAngle,
                               endAngle: endAngle,
                               clockwise: true,
                               steps: 10)

        // 4) Right vertical (start from arc end)
        let rightVerticalStart = arc.last.flatMap { seg -> CGPoint? in
            if case let .line(pt) = seg { return pt }
            return nil
        } ?? CGPoint(x: rightX, y: midY)

        let rightVertical: [StrokeSegment] = [
            .line(rightVerticalStart),
            .line(CGPoint(x: rightX, y: bottomY))
        ]

        return [leftVertical, horizontalLine, arc, rightVertical]
    }

    private static func oLowercase(_ mode: LetterMode) -> [[StrokeSegment]] {
        let line2 = line2(for: mode)
        let line3 = line3(for: mode)
        
        let center = CGPoint(x: 0.5, y: (line2 + line3) / 2)       // vertical center
        let radius: CGFloat = (line3 - line2) / 2                  // radius to fit between line1 & line3
        let circle = arcForCircle(
            center: center,
            radius: radius,
            startAngle: 3 * CGFloat.pi / 2,// full circle clockwise
            endAngle: -CGFloat.pi / 2,   // start at top (90°)
            clockwise: true,
            steps: 40
        )
        return [circle]
    }
    
    // --- p and q (top arc + descending stem) ---
    private static func lowercaseTopArcStemLetter(
        _ arcTopY: CGFloat = line2,       // top of arc
        _ arcBottomY: CGFloat = line3,    // bottom of arc
        _ stemBottomY: CGFloat = line4,   // bottom of stem
        _ flipHorizontally: Bool = false
    ) -> [[StrokeSegment]] {

        // Arc / circle part (top) between arcTopY → arcBottomY
        let centerX: CGFloat = 0.5
        let centerY = (arcTopY + arcBottomY) / 2
        let radiusY = (arcBottomY - arcTopY) / 2
        let radiusX = radiusY * 0.9

        let sweep = 0.7 * 2.0 * .pi
        let midAngle = CGFloat.pi
        let startAngle = midAngle - sweep / 2.0
        let endAngle = midAngle + sweep / 2.0

        var arc = arcForCircle(center: CGPoint(x: centerX, y: centerY),
                               radius: radiusX,
                               startAngle: endAngle,
                               endAngle: startAngle,
                               clockwise: true,
                               steps: 25)

        // Adjust Y scale for ellipse shape and flip if needed
        arc = arc.map { seg in
            switch seg {
            case .line(let pt):
                let scaledY = (pt.y - centerY) * (radiusY / radiusX) + centerY
                let x = flipHorizontally ? 1.0 - pt.x : pt.x
                return .line(CGPoint(x: x, y: scaledY))
            default: return seg
            }
        }

        // Determine stem X: right for p, left for q
        let stemX = arc.last.flatMap { seg -> CGFloat? in
            if case let .line(pt) = seg { return pt.x }
            return nil
        } ?? (flipHorizontally ? centerX - radiusX : centerX + radiusX)

        // Vertical stem: from bottom of arc → stemBottomY
        let verticalLine: [StrokeSegment] = [
            .line(CGPoint(x: stemX, y: arcTopY)),
            .line(CGPoint(x: stemX, y: stemBottomY))
        ]

        return flipHorizontally ? [verticalLine, arc] : [arc, verticalLine]
    }

    // p: arc top line2→line3, stem line3→line4
    private static func pLowercase(_ mode: LetterMode) -> [[StrokeSegment]] {
        let line2 = line2(for: mode)
        let line3 = line3(for: mode)
        let line4 = line4(for: mode)
        return lowercaseTopArcStemLetter(line2,line3,line4,true)
    }
    
    // q: mirrored arc top line2→line3, stem line3→line4
    private static func qLowercase(_ mode: LetterMode) -> [[StrokeSegment]] {
        let line2 = line2(for: mode)
        let line3 = line3(for: mode)
        let line4 = line4(for: mode)
        return lowercaseTopArcStemLetter(line2,line3,line4,false)
    }


    // --- r (vertical stem + bigger top-right cap) ---
    private static func rLowercase(_ mode: LetterMode) -> [[StrokeSegment]] {
        let line2 = line2(for: mode)
        let line3 = line3(for: mode)
        
        let topY: CGFloat = line2       // top of stem
        let bottomY: CGFloat = line3    // bottom of stem
        let stemX: CGFloat = 0.45

        // Vertical stem
        let verticalLine: [StrokeSegment] = [
            .line(CGPoint(x: stemX, y: topY)),
            .line(CGPoint(x: stemX, y: bottomY))
        ]

        // Bigger arc / cap starting at top of stem
        let arcRadius: CGFloat = 0.15           // increased radius
        let arcCenter = CGPoint(x: stemX + arcRadius, y: topY + arcRadius)  // center below topY
        let startAngle: CGFloat = CGFloat.pi    // start at left (touch stem)
        let endAngle: CGFloat = CGFloat.pi * 1.5  // curve downward-right
        let steps = 12                           // more steps for smoother arc

        let arc = arcForCircle(center: arcCenter,
                               radius: arcRadius,
                               startAngle: startAngle,
                               endAngle: endAngle,
                               clockwise: true,
                               steps: steps)

        return [verticalLine, arc]
    }

    // --- s (lowercase, perfect fit line2 → line3) ---
    private static func sLowercase(_ mode: LetterMode) -> [[StrokeSegment]] {
        let line2 = line2(for: mode)
        let line3 = line3(for: mode)
        
        let sweep: CGFloat = 0.58 * 2 * .pi // ~60% of a circle

        let topY = line2
        let bottomY = line3

        let centerYTop = topY + (bottomY - topY)/4          // top arc center
        let centerYBottom = topY + 3*(bottomY - topY)/4     // bottom arc center
        let radiusY = (bottomY - topY)/4
        let radiusX = radiusY

        // --- Top Arc (open on right) ---
        let midAngleTop = CGFloat.pi
        let startAngleTop = midAngleTop - sweep / 2
        let endAngleTop   = midAngleTop + sweep / 2

        let topArc = arcForCircle(center: CGPoint(x: 0.5, y: centerYTop),
                                  radius: radiusX,
                                  startAngle: endAngleTop,
                                  endAngle: startAngleTop,
                                  clockwise: true,
                                  steps: 25)

        guard case let .line(topEnd) = topArc.last! else { return [] }

        // --- Bottom Arc (open on left) ---
        let midAngleBottom = 0.0
        let startAngleBottom = midAngleBottom - sweep / 2
        let endAngleBottom   = midAngleBottom + sweep / 2

        var bottomArc = arcForCircle(center: CGPoint(x: 0.5, y: centerYBottom),
                                     radius: radiusX,
                                     startAngle: startAngleBottom,
                                     endAngle: endAngleBottom,
                                     clockwise: false,
                                     steps: 25)

        // Snap bottom arc start to top arc end
        if case .line(let firstPoint) = bottomArc.first! {
            let dx = topEnd.x - firstPoint.x
            let dy = topEnd.y - firstPoint.y
            bottomArc = bottomArc.map { seg in
                if case .line(let pt) = seg {
                    return .line(CGPoint(x: pt.x + dx, y: pt.y + dy))
                }
                return seg
            }
        }

        // Optional rotation
        let rotationCenter = CGPoint(x: 0.5, y: (topY + bottomY)/2)
        let rotationAngle: CGFloat = .pi / 7
        let rotatedTop = rotate(stroke: topArc, around: rotationCenter, by: rotationAngle)
        let rotatedBottom = rotate(stroke: bottomArc, around: rotationCenter, by: rotationAngle)

        return [rotatedTop, rotatedBottom]
    }

    
    private static func tLowercase(_ mode: LetterMode) -> [[StrokeSegment]] {
        let line1 = line1(for: mode)
        let line3 = line3(for: mode)
       
        let stem: [StrokeSegment] = [
            .line(CGPoint(x: 0.5, y: line1)),
            .line(CGPoint(x: 0.5, y: line3))
        ]

        let horizontal: [StrokeSegment] = [
            .line(CGPoint(x: 0.38, y: center12)),
            .line(CGPoint(x: 0.62, y: center12))
        ]

        return [stem, horizontal]
    }
    
    private static func uLowercase(_ mode: LetterMode) -> [[StrokeSegment]] {
        let line2 = line2(for: mode)
        let line3 = line3(for: mode)
            
        let topY = line2
        let bottomY = line3

        let leftX: CGFloat = 0.40
        let rightX: CGFloat = 0.62

        // --- Left vertical ---
        let leftBottomY = topY + (bottomY - topY) * 0.68
        let leftVertical: [StrokeSegment] = [
            .line(CGPoint(x: leftX, y: topY)),
            .line(CGPoint(x: leftX, y: leftBottomY))
        ]

        // --- Right vertical ---
//        let rightBottomY = bottomY - (bottomY - topY) * 0.05
        let rightBottomY = line3
        let rightVertical: [StrokeSegment] = [
            .line(CGPoint(x: rightX, y: topY)),
            .line(CGPoint(x: rightX, y: line3))
        ]

        // --- Two bottom curves ---
        let arcStart = CGPoint(x: leftX, y: leftBottomY)
        let midPoint = CGPoint(x: (leftX + rightX) / 2, y: bottomY - 0.01)
        let arcEnd   = CGPoint(x: rightX, y: rightBottomY - 0.02)

        // First curve
        let firstCurve = quadCurveForPoints(
            start: arcStart,
            end: midPoint,
            control: CGPoint(x: leftX, y: bottomY),
            steps: 15
        )

        // Second curve
        let secondCurve = quadCurveForPoints(
            start: midPoint,
            end: arcEnd,
            control: CGPoint(x: rightX, y: bottomY - 0.02),
            steps: 15
        )

        return [leftVertical, firstCurve, secondCurve, rightVertical]
    }

    private static func vLowercase(_ mode: LetterMode) -> [[StrokeSegment]] {
        let line2 = line2(for: mode)
        let line3 = line3(for: mode)
        
        let topY = line2
        let bottomY = line3
        let leftX: CGFloat = 0.40
        let rightX: CGFloat = 0.62
        let midX = (leftX + rightX) / 2

        let leftStroke: [StrokeSegment] = [
            .line(CGPoint(x: leftX, y: topY)),
            .line(CGPoint(x: midX, y: bottomY))
        ]

        let rightStroke: [StrokeSegment] = [
            .line(CGPoint(x: midX, y: bottomY)),
            .line(CGPoint(x: rightX, y: topY))
        ]

        return [leftStroke, rightStroke]
    }

    
    private static func wLowercase(_ mode: LetterMode) -> [[StrokeSegment]] {
        let line2 = line2(for: mode)
        let line3 = line3(for: mode)
        
        let topY = line2
        let bottomY = line3
        let leftX: CGFloat = 0.35
        let mid1X: CGFloat = 0.45
        let mid2X: CGFloat = 0.55
        let rightX: CGFloat = 0.65

        // Stroke 1: left down
        let stroke1: [StrokeSegment] = [
            .line(CGPoint(x: leftX, y: topY)),
            .line(CGPoint(x: mid1X, y: bottomY))
        ]

        // Stroke 2: up
        let stroke2: [StrokeSegment] = [
            .line(CGPoint(x: mid1X, y: bottomY)),
            .line(CGPoint(x: mid2X, y: topY))
        ]

        // Stroke 3: down
        let stroke3: [StrokeSegment] = [
            .line(CGPoint(x: mid2X, y: topY)),
            .line(CGPoint(x: rightX, y: bottomY))
        ]

        // Stroke 4: up again (final upstroke to close the w shape)
        let stroke4: [StrokeSegment] = [
            .line(CGPoint(x: rightX, y: bottomY)),
            .line(CGPoint(x: rightX + 0.1, y: topY)) // extend slightly to the right
        ]

        return [stroke1, stroke2, stroke3, stroke4]
    }


    private static func xLowercase(_ mode: LetterMode) -> [[StrokeSegment]] {
        let line2 = line2(for: mode)
        let line3 = line3(for: mode)
        
        let topY = line2
        let bottomY = line3
        let leftX: CGFloat = 0.40
        let rightX: CGFloat = 0.62

        let diag1: [StrokeSegment] = [
            .line(CGPoint(x: leftX, y: topY)),
            .line(CGPoint(x: rightX, y: bottomY))
        ]

        let diag2: [StrokeSegment] = [
            .line(CGPoint(x: rightX, y: topY)),
            .line(CGPoint(x: leftX, y: bottomY))
        ]

        return [diag1, diag2]
    }
    
 
    
    private static func yLowercase(_ mode: LetterMode) -> [[StrokeSegment]] {
        let topY = line2(for: mode)       // top of letter
        let baseline = line3(for: mode)   // middle of letter
        let descender = line4(for: mode)  // bottom of letter

        let leftX: CGFloat = 0.40
        let rightX: CGFloat = 0.62
        let midX = (leftX + rightX) / 2

        // Shared join point at baseline
        let join = CGPoint(x: midX, y: baseline)

        // --- Left stroke: top → baseline (smooth curve) ---
        let leftStroke: [StrokeSegment] = [
            .line(CGPoint(x: leftX, y: topY)),
            .quadCurve(
                to: join,
                control: CGPoint(x: (leftX + midX)/2, y: (topY + baseline)/2) // midpoint for smooth curve
            )
        ]

        // --- Right stroke: top → baseline join → descender ---
        let rightStrokeStart = CGPoint(x: rightX, y: topY)
        let curveEnd = CGPoint(x: join.x - 0.12, y: descender)

        // Control point between baseline and descender
        let rightControl = CGPoint(
            x: (join.x + curveEnd.x) / 2,
            y: (baseline + descender) / 2
        )

        let rightStroke: [StrokeSegment] = [
            .line(rightStrokeStart),
            .quadCurve(to: curveEnd, control: rightControl)
        ]

        return [leftStroke, rightStroke]
    }


    private static func zLowercase(_ mode: LetterMode) -> [[StrokeSegment]] {
        let line2 = line2(for: mode)
        let line3 = line3(for: mode)
        
        let topY = line2
        let bottomY = line3
        let leftX: CGFloat = 0.40
        let rightX: CGFloat = 0.62

        let topLine: [StrokeSegment] = [
            .line(CGPoint(x: leftX, y: topY)),
            .line(CGPoint(x: rightX, y: topY))
        ]

        let diagonal: [StrokeSegment] = [
            .line(CGPoint(x: rightX, y: topY)),
            .line(CGPoint(x: leftX, y: bottomY))
        ]

        let bottomLine: [StrokeSegment] = [
            .line(CGPoint(x: leftX, y: bottomY)),
            .line(CGPoint(x: rightX, y: bottomY))
        ]

        return [topLine, diagonal, bottomLine]
    }


}


fileprivate extension CGPoint {
    func rotated(around center: CGPoint, by angle: CGFloat) -> CGPoint {
        let dx = x - center.x
        let dy = y - center.y
        let cosA = cos(angle)
        let sinA = sin(angle)
        let xNew = dx * cosA - dy * sinA + center.x
        let yNew = dx * sinA + dy * cosA + center.y
        return CGPoint(x: xNew, y: yNew)
    }
}
// ── Sampler (ported verbatim from LetterTracingViewModelExtension.swift) ─────
func scale(_ p: CGPoint, in rect: CGRect) -> CGPoint {
    CGPoint(x: rect.minX + p.x * rect.width, y: rect.minY + p.y * rect.height)
}

func interpolate(_ a: CGPoint, _ b: CGPoint, step: CGFloat) -> [CGPoint] {
    guard a.x.isFinite, a.y.isFinite, b.x.isFinite, b.y.isFinite else { return [] }
    var result: [CGPoint] = []
    let dx = b.x - a.x, dy = b.y - a.y
    let dist = hypot(dx, dy)
    let steps = max(1, Int(dist / step))
    for i in 0...steps {
        let t = CGFloat(i) / CGFloat(steps)
        result.append(CGPoint(x: a.x + dx * t, y: a.y + dy * t))
    }
    return result
}

func interpolateQuadCurve(start: CGPoint, control: CGPoint, end: CGPoint, step: CGFloat) -> [CGPoint] {
    guard start.x.isFinite, start.y.isFinite, control.x.isFinite, control.y.isFinite,
          end.x.isFinite, end.y.isFinite, step > 0 else { return [] }
    var points: [CGPoint] = []
    let dist = hypot(end.x - start.x, end.y - start.y)
    let steps = max(1, Int(dist / step))
    for i in 0...steps {
        let t = CGFloat(i) / CGFloat(steps)
        let x = pow(1 - t, 2) * start.x + 2 * (1 - t) * t * control.x + pow(t, 2) * end.x
        let y = pow(1 - t, 2) * start.y + 2 * (1 - t) * t * control.y + pow(t, 2) * end.y
        points.append(CGPoint(x: x, y: y))
    }
    return points
}

func sampledGuide(from strokes: [[StrokeSegment]], in rect: CGRect, spacing: CGFloat) -> [CGPoint] {
    var guide: [CGPoint] = []
    for stroke in strokes {
        var last: CGPoint? = nil
        for seg in stroke {
            switch seg {
            case .line(let pt):
                let scaled = scale(pt, in: rect)
                if let l = last { guide += interpolate(l, scaled, step: spacing) }
                last = scaled
            case .quadCurve(let to, let control):
                if let l = last {
                    guide += interpolateQuadCurve(start: l, control: scale(control, in: rect), end: scale(to, in: rect), step: spacing)
                }
                last = scale(to, in: rect)
            case .arc(let center, let radius, let startAngle, let endAngle, _):
                let steps = max(2, Int(abs(endAngle - startAngle) / 0.05))
                for i in 0...steps {
                    let t = CGFloat(i) / CGFloat(steps)
                    let angle = startAngle + t * (endAngle - startAngle)
                    let pt = CGPoint(x: center.x + radius * cos(angle), y: center.y + radius * sin(angle))
                    guide.append(scale(pt, in: rect))
                }
            }
        }
    }
    return guide
}

// ── Dump: for each letter (both cases), sample each stroke into a normalized polyline ──
let REF: CGFloat = 1000
let rect = CGRect(x: 0, y: 0, width: REF, height: REF)
let spacing: CGFloat = 4  // dense enough for smooth drawing; matches app guide feel

let allChars = Array("ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz")
var out: [String: [[[Double]]]] = [:]

func round4(_ v: CGFloat) -> Double { (Double(v) * 10000).rounded() / 10000 }

for ch in allChars {
    let mode: LetterMode = ch.isUppercase ? .uppercase : .lowercase
    let strokes = LetterSkeleton.strokes(for: ch, mode: mode)
    // Mirror vm.guides(in:) — each stroke sampled on its own → one polyline per stroke.
    let polylines: [[[Double]]] = strokes.map { stroke in
        sampledGuide(from: [stroke], in: rect, spacing: spacing).map { [round4($0.x / REF), round4($0.y / REF)] }
    }
    out[String(ch)] = polylines
}

let data = try! JSONSerialization.data(withJSONObject: out, options: [.sortedKeys])
FileHandle.standardOutput.write(data)
