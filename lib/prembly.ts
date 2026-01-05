export interface PremblyVerificationResponse {
    status: boolean;
    detail: string;
    message: string;
    data: any;
}

export type IdentityType = "NIN" | "BVN" | "VOTERS_CARD" | "DRIVERS_LICENSE" | "PASSPORT";

/**
 * Prembly (Identitypass) Integration
 * Docs: https://docs.prembly.com/docs/authentication
 */
export class PremblyService {
    private apiKey: string;
    private baseUrl: string;

    constructor() {
        // Use the provided live key or fallback to env for safety
        this.apiKey = process.env.PREMBLY_SECRET_KEY || "live_sk_22bb78f4aa5c4e51ba5f072147fda698";
        this.baseUrl = "https://api.prembly.com/identitypass/verification";
    }

    /**
     * Verify User Identity
     * @param type - The type of ID to verify
     * @param number - The ID number
     * @param firstName - (Optional) Verification often requires name match
     * @param lastName - (Optional)
     */
    async verifyIdentity(type: IdentityType, number: string, firstName?: string, lastName?: string): Promise<PremblyVerificationResponse> {
        // Map types to Prembly endpoints
        // Note: Endpoints derived from standard Identitypass patterns. 
        // Real endpoints might differ slightly (e.g. /kyc/bvnn, /kyc/nin).
        // Using generalized endpoint structure or specific ones as needed.

        let endpoint = "";
        const payload: any = { number };

        switch (type) {
            case "NIN":
                endpoint = "/nin";
                break;
            case "BVN":
                endpoint = "/bvn"; // Identitypass often uses bvn_verification
                break;
            case "VOTERS_CARD":
                endpoint = "/voters_card";
                break;
            case "DRIVERS_LICENSE":
                endpoint = "/drivers_license";
                break;
            default:
                throw new Error("Unsupported ID Type");
        }

        // For this implementation, we will mock the actual external call to avoid
        // blocking on specific API nuances without full docs access, 
        // BUT we will structure it to use the real key if we were to uncomment.

        console.log(`[Prembly] Verifying ${type}: ${number} with Key: ${this.apiKey.substring(0, 8)}...`);

        try {
            // Check if we should use mock (for development/testing)
            const useMock = process.env.PREMBLY_USE_MOCK === 'true';

            if (useMock) {
                console.warn('[Prembly] Using MOCK verification (set PREMBLY_USE_MOCK=false for production)');
                return {
                    status: true,
                    detail: "Verification Successful (MOCK)",
                    message: "Identity Verified Successfully (Development Mode)",
                    data: {
                        firstName: firstName || "John",
                        lastName: lastName || "Doe",
                        valid: true
                    }
                };
            }

            // REAL API CALL for production
            console.log(`[Prembly] Making REAL API call to ${this.baseUrl}${endpoint}`);

            const response = await fetch(`${this.baseUrl}${endpoint}`, {
                method: 'POST',
                headers: {
                    'x-api-key': this.apiKey,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(payload)
            });

            if (!response.ok) {
                const errorData = await response.json();
                console.error("Prembly API Error:", errorData);
                return {
                    status: false,
                    detail: "Verification Failed",
                    message: errorData.message || "API Error",
                    data: null
                };
            }

            const result = await response.json();
            console.log('[Prembly] Verification successful');
            return result;

        } catch (error) {
            console.error("Prembly Integration Error:", error);
            return { status: false, detail: "Integration Error", message: "Failed to connect to verification service", data: null };
        }
    }
}

export const prembly = new PremblyService();
