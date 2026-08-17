import type { ComponentType } from 'react';
import type { SvgProps } from 'react-native-svg';

import IncidentEmergency from '@/assets/icons/incident-emergency.svg';
import IncidentOther from '@/assets/icons/incident-other.svg';
import IncidentOvertime from '@/assets/icons/incident-overtime.svg';
import IncidentSleep from '@/assets/icons/incident-sleep.svg';
import RoutineCaffeine from '@/assets/icons/routine-caffeine.svg';
import RoutineCommute from '@/assets/icons/routine-commute.svg';
import RoutineMeal from '@/assets/icons/routine-meal.svg';
import RoutineSleep from '@/assets/icons/routine-sleep.svg';
import RoutineWake from '@/assets/icons/routine-wake.svg';
import RoutineWork from '@/assets/icons/routine-work.svg';
import ShiftCustom from '@/assets/icons/shift-custom.svg';
import ShiftDay from '@/assets/icons/shift-day.svg';
import ShiftNight from '@/assets/icons/shift-night.svg';
import ShiftThree from '@/assets/icons/shift-three.svg';
import ShiftTwo from '@/assets/icons/shift-two.svg';
import type { IncidentTypeId, RoutineIconName, ShiftTypeId } from '@/types/domain';

export const shiftIconMap: Record<ShiftTypeId, ComponentType<SvgProps>> = {
  'fixed-day': ShiftDay,
  'fixed-night': ShiftNight,
  'two-shift': ShiftTwo,
  'three-shift': ShiftThree,
  custom: ShiftCustom,
};

export const routineIconMap: Record<RoutineIconName, ComponentType<SvgProps>> = {
  wake: RoutineWake,
  meal: RoutineMeal,
  caffeine: RoutineCaffeine,
  commute: RoutineCommute,
  work: RoutineWork,
  sleep: RoutineSleep,
};

export const incidentIconMap: Record<IncidentTypeId, ComponentType<SvgProps>> = {
  overtime: IncidentOvertime,
  emergency: IncidentEmergency,
  'sleep-interrupted': IncidentSleep,
  other: IncidentOther,
};
