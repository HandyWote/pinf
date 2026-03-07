export type DateTimePickerEventLike = {
  type?: 'set' | 'dismissed' | 'neutralButtonPressed';
};

type ResolvePickerChangeParams = {
  platform: string;
  event?: DateTimePickerEventLike;
  selected?: Date;
};

type ResolvePickerChangeResult = {
  shouldClose: boolean;
  shouldApply: boolean;
};

export const resolvePickerChange = ({
  platform,
  event,
  selected,
}: ResolvePickerChangeParams): ResolvePickerChangeResult => {
  if (platform === 'android') {
    return {
      shouldClose: true,
      shouldApply: event?.type === 'set' && !!selected,
    };
  }

  return {
    shouldClose: false,
    shouldApply: !!selected,
  };
};
