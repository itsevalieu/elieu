package com.evalieu.newsletter.dto;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class HealthResponse {

	private String db;
	private String s3;
	private String ses;
}
