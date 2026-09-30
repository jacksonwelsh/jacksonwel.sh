export const powerZones: Record<number, { name: string; color: string }> = {
	1: { name: 'Active Recovery', color: '#8283F3' },
	2: { name: 'Endurance', color: '#5FB8F9' },
	3: { name: 'Tempo', color: '#64D7A9' },
	4: { name: 'Threshold', color: '#B1D946' },
	5: { name: 'VO₂ Max', color: '#F6C849' },
	6: { name: 'Anaerobic', color: '#F09048' },
	7: { name: 'Neuromuscular', color: '#DA555B' }
};

export function hoveredPowerZone(power: number, upperBounds: number[] | undefined) {
	if (!upperBounds || upperBounds.length !== 6 || !Number.isFinite(power) || power < 0)
		return undefined;
	const index = upperBounds.findIndex((upper) => power <= upper);
	return index < 0 ? 7 : index + 1;
}
