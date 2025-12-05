export async function fetchData(url: string, dataConfig: any) {
    try {
        const controller = new AbortController();
        const signal = controller.signal;

        const response = await fetch(url, {
            method: "POST",
            mode: "cors",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(dataConfig),
            signal: signal,
        })

        if (response.ok) {
            const json = await response.json();
            return json?.data?.OUT_CURSOR || [];
        } else {
            return [];
        }
    } catch (error) {
        console.error('Error fetching data:', error);
        return []; // Return fallback data in case of an error
    }
};