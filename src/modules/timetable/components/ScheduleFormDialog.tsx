"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { CreateScheduleSchema, DayOfWeekEnum, ClassTypeEnum } from "../schemas/schedule.schema";
import { mockOfferings } from "../services/timetable.service";
import { useCreateSchedule, useUpdateSchedule, useScheduleById } from "../hooks/useTimetable";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Loader2 } from "lucide-react";

// Use base object schema without the refine for the form
const FormSchema = z.object({
    offeringId: z.coerce.number().min(1, "Required"),
    dayOfWeek: DayOfWeekEnum,
    startTime: z.string().min(1, "Required"),
    endTime: z.string().min(1, "Required"),
    venue: z.string().min(1, "Required"),
    classType: ClassTypeEnum,
});
type FormValues = z.infer<typeof FormSchema>;

const DAYS = DayOfWeekEnum.options;
const CLASS_TYPES = ClassTypeEnum.options;

interface ScheduleFormDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    editingScheduleId?: number | null;
}

export function ScheduleFormDialog({ open, onOpenChange, editingScheduleId }: ScheduleFormDialogProps) {
    const isEdit = !!editingScheduleId;

    const { data: existing } = useScheduleById(editingScheduleId ?? 0, isEdit && open);

    const createMutation = useCreateSchedule();
    const updateMutation = useUpdateSchedule();
    const isPending = createMutation.isPending || updateMutation.isPending;

    const {
        register,
        handleSubmit,
        setValue,
        watch,
        reset,
        formState: { errors },
    } = useForm<FormValues>({
        resolver: zodResolver(FormSchema),
        defaultValues: {
            classType: "LECTURE",
            dayOfWeek: "MONDAY",
        },
    });

    // Populate form when editing
    useEffect(() => {
        if (existing) {
            const offering = mockOfferings.find((o) => o.courseCode === existing.courseCode);
            reset({
                offeringId: offering?.id ?? 0,
                dayOfWeek: existing.dayOfWeek,
                startTime: existing.startTime,
                endTime: existing.endTime,
                venue: existing.venue,
                classType: existing.classType,
            });
        } else if (!isEdit) {
            reset({ classType: "LECTURE", dayOfWeek: "MONDAY" });
        }
    }, [existing, isEdit, reset]);

    const selectedOfferingId = watch("offeringId");
    const selectedOffering = mockOfferings.find((o) => o.id === Number(selectedOfferingId));

    function onSubmit(values: FormValues) {
        const dto = {
            offeringId: values.offeringId,
            lecturerId: selectedOffering?.lecturerId ?? 1,
            dayOfWeek: values.dayOfWeek,
            startTime: values.startTime,
            endTime: values.endTime,
            venue: values.venue,
            classType: values.classType,
        };

        if (isEdit && editingScheduleId) {
            updateMutation.mutate(
                { id: editingScheduleId, dto },
                {
                    onSuccess: () => {
                        onOpenChange(false);
                        reset();
                    },
                }
            );
        } else {
            createMutation.mutate(dto, {
                onSuccess: () => {
                    onOpenChange(false);
                    reset();
                },
            });
        }
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-md">
                <DialogHeader>
                    <DialogTitle>{isEdit ? "Edit Schedule" : "Create Schedule"}</DialogTitle>
                </DialogHeader>

                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 pt-1">
                    {/* Course Offering */}
                    <div className="space-y-1">
                        <Label className="text-xs">Course Offering</Label>
                        <Select
                            defaultValue={selectedOfferingId?.toString()}
                            onValueChange={(v) => setValue("offeringId", Number(v))}
                        >
                            <SelectTrigger>
                                <SelectValue placeholder="Select course" />
                            </SelectTrigger>
                            <SelectContent>
                                {mockOfferings.map((o) => (
                                    <SelectItem key={o.id} value={o.id.toString()}>
                                        {o.courseCode} – {o.courseTitle}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        {errors.offeringId && <p className="text-xs text-destructive">{errors.offeringId.message}</p>}
                    </div>

                    {/* Lecturer (auto-populated) */}
                    {selectedOffering && (
                        <p className="text-xs text-muted-foreground -mt-2">
                            Lecturer: <span className="font-medium text-foreground">{selectedOffering.lecturerName}</span>
                        </p>
                    )}

                    {/* Day of week + Class type side by side */}
                    <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-1">
                            <Label className="text-xs">Day of Week</Label>
                            <Select defaultValue="MONDAY" onValueChange={(v) => setValue("dayOfWeek", v as typeof DAYS[0])}>
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    {DAYS.map((d) => (
                                        <SelectItem key={d} value={d}>
                                            {d.charAt(0) + d.slice(1).toLowerCase()}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-1">
                            <Label className="text-xs">Class Type</Label>
                            <Select defaultValue="LECTURE" onValueChange={(v) => setValue("classType", v as typeof CLASS_TYPES[0])}>
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    {CLASS_TYPES.map((t) => (
                                        <SelectItem key={t} value={t}>
                                            {t.charAt(0) + t.slice(1).toLowerCase()}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    {/* Start + End time */}
                    <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-1">
                            <Label htmlFor="startTime" className="text-xs">Start Time</Label>
                            <Input id="startTime" type="time" {...register("startTime")} />
                            {errors.startTime && <p className="text-xs text-destructive">{errors.startTime.message}</p>}
                        </div>
                        <div className="space-y-1">
                            <Label htmlFor="endTime" className="text-xs">End Time</Label>
                            <Input id="endTime" type="time" {...register("endTime")} />
                            {errors.endTime && <p className="text-xs text-destructive">{errors.endTime.message}</p>}
                        </div>
                    </div>

                    {/* Venue */}
                    <div className="space-y-1">
                        <Label htmlFor="venue" className="text-xs">Venue</Label>
                        <Input id="venue" placeholder="e.g. LT-1" {...register("venue")} />
                        {errors.venue && <p className="text-xs text-destructive">{errors.venue.message}</p>}
                    </div>

                    {/* Actions */}
                    <div className="flex justify-end gap-2 pt-2">
                        <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={isPending}>
                            Cancel
                        </Button>
                        <Button type="submit" disabled={isPending} className="gap-2 min-w-24">
                            {isPending && <Loader2 size={13} className="animate-spin" />}
                            {isEdit ? "Save Changes" : "Create"}
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
}
