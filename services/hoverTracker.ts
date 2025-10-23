// services/hoverTracker.ts
export class HoverTracker {
    private hoverStartTime: Map<string, number> = new Map();
    private totalHoverTime: Map<string, number> = new Map();

    public startHover(companyName: string): void {
        this.hoverStartTime.set(companyName, Date.now());
    }

    public endHover(companyName: string): void {
        const startTime = this.hoverStartTime.get(companyName);
        if (startTime) {
            const duration = Date.now() - startTime;
            const currentTotal = this.totalHoverTime.get(companyName) || 0;
            this.totalHoverTime.set(companyName, currentTotal + duration);
            this.hoverStartTime.delete(companyName);
        }
    }

    public getHoverData(): Map<string, number> {
        // Before returning, account for any currently active hovers
        this.hoverStartTime.forEach((startTime, companyName) => {
            const duration = Date.now() - startTime;
            const currentTotal = this.totalHoverTime.get(companyName) || 0;
            this.totalHoverTime.set(companyName, currentTotal + duration);
            this.hoverStartTime.set(companyName, Date.now()); // Reset start time for next call
        });
        return new Map(this.totalHoverTime);
    }

    public reset(): void {
        this.hoverStartTime.clear();
        this.totalHoverTime.clear();
    }
}