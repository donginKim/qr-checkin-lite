package com.yourco.qrcheckin.common.util;

public final class PhoneNormalizer {

    public static String normalize(String phone) {
        if (phone == null) return "";
        return phone.replaceAll("[^0-9]", "");
    }

    public static String last4(String normalizedPhone) {
        if (normalizedPhone == null) return "";
        if (normalizedPhone.length() <= 4) return normalizedPhone;
        return normalizedPhone.substring(normalizedPhone.length() - 4);
    }
}
