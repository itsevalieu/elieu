package com.evalieu.newsletter.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.util.StringUtils;
import software.amazon.awssdk.auth.credentials.DefaultCredentialsProvider;
import software.amazon.awssdk.regions.Region;
import software.amazon.awssdk.regions.providers.DefaultAwsRegionProviderChain;
import software.amazon.awssdk.services.s3.S3Client;
import software.amazon.awssdk.services.s3.presigner.S3Presigner;

@Configuration
public class S3Config {

    @Value("${aws.s3.bucket}")
    private String bucket;

    public String getBucket() {
        return bucket;
    }

    @Value("${aws.s3.region:}")
    private String region;

    @Bean
    public S3Client s3Client() {
        return S3Client.builder()
            .region(resolveRegion())
            .credentialsProvider(DefaultCredentialsProvider.create())
            .build();
    }

    @Bean
    public S3Presigner s3Presigner() {
        return S3Presigner.builder()
            .region(resolveRegion())
            .credentialsProvider(DefaultCredentialsProvider.create())
            .build();
    }

    private Region resolveRegion() {
        if (StringUtils.hasText(region)) {
            return Region.of(region.trim());
        }
        try {
            return DefaultAwsRegionProviderChain.builder().build().getRegion();
        } catch (Exception e) {
            return Region.US_EAST_1;
        }
    }
}
