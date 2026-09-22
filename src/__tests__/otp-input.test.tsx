import { fireEvent, render, screen } from '@testing-library/react-native';

import { OtpInput } from '@/components/ui/otp-input';

describe('OtpInput', () => {
  it('strips non-digits and calls onComplete when full', async () => {
    const onChange = jest.fn();
    const onComplete = jest.fn();
    await render(<OtpInput value="" onChange={onChange} onComplete={onComplete} length={6} />);

    await fireEvent.changeText(screen.getByLabelText('Verification code'), '12-34 56');

    expect(onChange).toHaveBeenCalledWith('123456');
    expect(onComplete).toHaveBeenCalledWith('123456');
  });
});
