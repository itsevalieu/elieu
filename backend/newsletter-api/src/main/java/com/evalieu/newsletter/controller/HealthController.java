package com.evalieu.newsletter.controller;

import java.sql.Connection;
import java.sql.ResultSet;
import java.sql.Statement;

import javax.sql.DataSource;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

import com.evalieu.newsletter.dto.HealthResponse;

import lombok.RequiredArgsConstructor;

@RestController
@RequiredArgsConstructor
public class HealthController {

	private final DataSource dataSource;

	@Value("${aws.s3.bucket:}")
	private String awsS3Bucket;

	@Value("${aws.s3.region:}")
	private String awsS3Region;

	@Value("${aws.ses.region:}")
	private String awsSesRegion;

	@GetMapping("/api/health")
	public HealthResponse health() {
		String db = "error";
		try (Connection conn = dataSource.getConnection();
				Statement st = conn.createStatement();
				ResultSet rs = st.executeQuery("SELECT 1")) {
			if (rs.next()) {
				db = "ok";
			}
		} catch (Exception ignored) {
			db = "error";
		}
		String s3 = configured(awsS3Bucket) && configured(awsS3Region) ? "configured" : "not_configured";
		String ses = configured(awsSesRegion) ? "configured" : "not_configured";
		return HealthResponse.builder().db(db).s3(s3).ses(ses).build();
	}

	private static boolean configured(String value) {
		return value != null && !value.isBlank();
	}
}
