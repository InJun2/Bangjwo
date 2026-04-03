package com.bangjwo.global.common.util;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

@Component
public class ImageUrlUtil {
	private static String s3BaseUrl;

	@Value("${aws.s3.base-url}")
	public void setS3BaseUrl(String s3BaseUrl) {
		ImageUrlUtil.s3BaseUrl = s3BaseUrl;
	}

	public static String getFullUrl(String relativePath) {
		if (relativePath == null || relativePath.isEmpty()) {
			return null;
		}

		if (relativePath.startsWith("http")) {
			return relativePath;
		}

		return s3BaseUrl + relativePath;
	}
}