package com.evalieu.newsletter.dto;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class PresignResponse {

	private String uploadUrl;
	private String objectUrl;
}
