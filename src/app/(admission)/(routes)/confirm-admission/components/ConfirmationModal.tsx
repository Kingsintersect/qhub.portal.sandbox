import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { AlertTriangle, Loader2 } from 'lucide-react';

interface ConfirmationModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    isLoading: boolean;
}

export function ConfirmationModal({
    isOpen,
    onClose,
    onConfirm,
    isLoading,
}: ConfirmationModalProps) {
    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <DialogContent>
                <DialogHeader>
                    <div className="mx-auto mb-2 flex size-14 items-center justify-center rounded-full bg-amber-500/10 dark:bg-amber-500/20">
                        <AlertTriangle className="size-7 text-amber-500" />
                    </div>
                    <DialogTitle className="text-center text-xl">
                        Confirm Your Decision
                    </DialogTitle>
                    <p className="text-center text-sm text-muted-foreground">
                        Are you sure you want to accept this admission offer?
                    </p>
                </DialogHeader>

                <div className="rounded-lg border border-primary/20 bg-primary/5 p-4 dark:bg-primary/10">
                    <p className="text-xs leading-relaxed text-muted-foreground">
                        <span className="font-semibold text-foreground">Note:</span> After
                        acceptance, you&apos;ll need to complete enrollment within 14 days to secure
                        your seat.
                    </p>
                </div>

                <DialogFooter className="gap-2 sm:gap-0">
                    <Button
                        variant="outline"
                        onClick={onClose}
                        disabled={isLoading}
                    >
                        Cancel
                    </Button>
                    <Button
                        onClick={onConfirm}
                        disabled={isLoading}
                        className="gap-2"
                    >
                        {isLoading ? (
                            <>
                                <Loader2 className="size-4 animate-spin" />
                                Processing…
                            </>
                        ) : (
                            'Yes, Accept Offer'
                        )}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}