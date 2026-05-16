"use client"

type ScoreDisplayProps = {
    score: number
    depth: number
}

export function ScoreDisplay({ score, depth }: ScoreDisplayProps) {
    return (
        <div className="flex items-center gap-4 text-xs font-mono">
            <span className="text-[#8f7a5e]">score {score}</span>
            <span className="text-[#5e7a8f]">piso {depth}</span>
        </div>
    )
}
