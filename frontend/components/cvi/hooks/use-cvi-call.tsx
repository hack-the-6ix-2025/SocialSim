'use client';

import { useCallback } from 'react';
import { useDaily } from '@daily-co/daily-react';

export const useCVICall = (): {
	joinCall: (props: { url: string }) => void;
	leaveCall: () => void;
} => {
	const daily = useDaily();

	const joinCall = useCallback(
		({ url }: { url: string }) => {
			if (!url) {
				console.error("No URL provided to joinCall");
				return;
			}
			
			console.log("Joining call with URL:", url);
			daily?.join({
				url: url,
				inputSettings: {
					audio: {
						processor: {
							type: "noise-cancellation",
						},
					},
				},
			}).catch((error) => {
				console.error("Error joining call:", error);
			});
		},
		[daily]
	);

	const leaveCall = useCallback(() => {
		daily?.leave();
	}, [daily]);

	return { joinCall, leaveCall };
};
