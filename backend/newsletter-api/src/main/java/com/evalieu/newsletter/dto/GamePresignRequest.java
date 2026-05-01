package com.evalieu.newsletter.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class GamePresignRequest {

	@NotBlank
	private String gameSlug;

	@NotBlank
	private String filename;

	/** HTTP Content-Type header for the PUT body; defaults on the server when blank. */
	private String contentType;
}
