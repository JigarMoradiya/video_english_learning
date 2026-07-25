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
