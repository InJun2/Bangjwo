package com.bangjwo.portone.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import com.siot.IamportRestClient.IamportClient;

@Configuration
public class PaymentConfig {
	@Value("${imp.key}")
	private String apiKey;

	@Value("${imp.secret.pay}")
	private String secretKey;

	@Bean
	public IamportClient getIamportClient() {
		return new IamportClient(apiKey, secretKey);
	}

}
