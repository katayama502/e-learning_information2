import React from 'react';
import type { Rarity } from '../types/game';

export interface Skill {
    id: string;
    name: string;
    description: string;
    rarity: Rarity;
    effect: () => void;
}

interface SkillSelectProps {
    skills: Skill[];
    onSelect: (skill: Skill) => void;
    onReroll?: () => void;
    rerollsLeft?: number;
    onSelectAll?: () => void;
    selectAllsLeft?: number;
}

const getRarityColor = (rarity: Rarity) => {
    switch (rarity) {
        case 'COMMON': return '#39ff14';   // Green
        case 'RARE': return '#00f2ff';     // Blue
        case 'EPIC': return '#ff00ff';     // Purple
        case 'LEGENDARY': return '#ff8800'; // Orange
        case 'SUPREME': return '#ff0000';  // Red
        default: return '#fff';
    }
};

const SkillSelect: React.FC<SkillSelectProps> = ({ skills, onSelect, onReroll, rerollsLeft = 0, onSelectAll, selectAllsLeft = 0 }) => {
    return (
        <div className="game-over-overlay">
            <div style={{ background: 'var(--bg-panel)', padding: '20px', borderRadius: '8px', border: '2px solid var(--neon-blue)', width: '400px', maxWidth: '90%' }}>
                <h2 style={{ color: 'var(--neon-blue)', marginBottom: '20px', textAlign: 'center' }}>MOD_CHIPS.install()</h2>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '15px', marginBottom: '20px' }}>
                    {skills.map(skill => (
                        <button
                            key={skill.id}
                            className="btn-summon"
                            style={{
                                textAlign: 'left',
                                padding: '15px',
                                height: 'auto',
                                border: `2px solid ${getRarityColor(skill.rarity)}`,
                                boxShadow: `0 0 10px ${getRarityColor(skill.rarity)}66`
                            }}
                            onClick={() => onSelect(skill)}
                            onMouseEnter={(e) => {
                                e.currentTarget.style.backgroundColor = `${getRarityColor(skill.rarity)}33`;
                            }}
                            onMouseLeave={(e) => {
                                e.currentTarget.style.backgroundColor = 'transparent';
                            }}
                        >
                            <div style={{ fontWeight: 'bold', color: getRarityColor(skill.rarity) }}>
                                {skill.name} <span style={{ fontSize: '0.8rem' }}>({skill.rarity})</span>
                            </div>
                            <div style={{ fontSize: '0.8rem', opacity: 0.8, color: '#ddd' }}>{skill.description}</div>
                        </button>
                    ))}
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', gap: '10px' }}>
                    {onReroll && (
                        <button
                            className="btn-summon"
                            style={{ flex: 1, padding: '10px', fontSize: '0.9rem', opacity: rerollsLeft > 0 ? 1 : 0.5 }}
                            onClick={onReroll}
                            disabled={rerollsLeft <= 0}
                        >
                            引き直す ({rerollsLeft})
                        </button>
                    )}
                    {onSelectAll && (
                        <button
                            className="btn-summon"
                            style={{ flex: 1, padding: '10px', fontSize: '0.9rem', color: 'var(--neon-yellow)', borderColor: 'var(--neon-yellow)', opacity: selectAllsLeft > 0 ? 1 : 0.5 }}
                            onClick={onSelectAll}
                            disabled={selectAllsLeft <= 0}
                        >
                            全て取得 ({selectAllsLeft})
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};

export default SkillSelect;
