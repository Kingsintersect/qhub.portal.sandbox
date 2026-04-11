import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Clock, ShieldCheck, HelpCircle } from 'lucide-react';
import { SUPPORT_EMAIL, SUPPORT_PHONE } from '@/config/global.config';

const infoItems = [
    {
        icon: Clock,
        title: 'Deadline',
        description: 'Please accept your admission offer within 30 days to secure your seat',
    },
    {
        icon: ShieldCheck,
        title: 'Secure Process',
        description: 'Your admission acceptance is secured with end-to-end encryption',
    },
    {
        icon: HelpCircle,
        title: 'Need Help?',
        description: `Contact our admission office at ${SUPPORT_EMAIL} or call ${SUPPORT_PHONE}`,
    },
];

export const InformationSection = () => {
    return (
        <Card className="border-border/50 shadow-lg">
            <CardHeader>
                <CardTitle className="text-lg">Important Information</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                    {infoItems.map((item) => (
                        <div
                            key={item.title}
                            className="rounded-xl border border-border/50 bg-muted/30 p-4 dark:bg-muted/20"
                        >
                            <div className="mb-3 flex size-10 items-center justify-center rounded-lg bg-primary/10 dark:bg-primary/20">
                                <item.icon className="size-5 text-primary" />
                            </div>
                            <h4 className="mb-1 text-sm font-semibold text-foreground">
                                {item.title}
                            </h4>
                            <p className="text-xs leading-relaxed text-muted-foreground">
                                {item.description}
                            </p>
                        </div>
                    ))}
                </div>
            </CardContent>
        </Card>
    );
};
