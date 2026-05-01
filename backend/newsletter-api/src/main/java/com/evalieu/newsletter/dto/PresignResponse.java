package com.evalieu.newsletter.dto;

import com.fasterxml.jackson.annotation.JsonInclude;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
@JsonInclude(JsonInclude.Include.NON_NULL)
public class PresignResponse {

	private String uploadUrl;
	private String objectUrl;

	/** Set for multi-file game uploads: public HTTPS prefix ending with {@code games/{slug}/}. */
	private String assetsBaseUrl;
}
