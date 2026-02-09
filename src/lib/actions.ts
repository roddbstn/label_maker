'use server';

import { saveSubmission, Submission } from './storage';
import { revalidatePath } from 'next/cache';

export async function submitWaitlistAction(formData: FormData) {
    const email = formData.get('email') as string;

    if (!email) {
        return { error: '이메일을 입력해 주세요.' };
    }

    try {
        await saveSubmission({
            type: 'waitlist',
            email,
        });
        revalidatePath('/admin');
        return { success: true };
    } catch (error) {
        console.error('Submit waitlist error:', error);
        return { error: '데이터 저장에 실패했습니다.' };
    }
}

export async function submitFeedbackAction(formData: FormData) {
    const feedback = formData.get('feedback') as string;
    const organization = formData.get('organization') as string;

    if (!feedback) {
        return { error: '의견을 입력해 주세요.' };
    }

    try {
        await saveSubmission({
            type: 'feedback',
            feedback,
            organization,
        });
        revalidatePath('/admin');
        return { success: true };
    } catch (error) {
        console.error('Submit feedback error:', error);
        return { error: '데이터 저장에 실패했습니다.' };
    }
}
