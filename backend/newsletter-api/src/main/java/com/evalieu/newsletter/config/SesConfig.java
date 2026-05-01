package com.evalieu.newsletter.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.autoconfigure.condition.ConditionalOnExpression;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import software.amazon.awssdk.auth.credentials.DefaultCredentialsProvider;
import software.amazon.awssdk.regions.Region;
import software.amazon.awssdk.services.ses.SesClient;

@Configuration
public class SesConfig {

	@Value("${aws.ses.region:}")
	private String region;

	@Value("${aws.ses.from-email:newsletter@evalieu.com}")
	private String fromEmail;

	@Bean(destroyMethod = "close")
	@ConditionalOnExpression("!'${aws.ses.region:}'.isEmpty()")
	public SesClient sesClient() {
		return SesClient.builder()
				.region(Region.of(region))
				.credentialsProvider(DefaultCredentialsProvider.create())
				.build();
	}

	public String getFromEmail() {
		return fromEmail;
	}
}
