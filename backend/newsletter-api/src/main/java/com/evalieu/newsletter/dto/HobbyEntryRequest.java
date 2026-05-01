package com.evalieu.newsletter.dto;

import java.time.LocalDate;
import java.util.Map;

import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class HobbyEntryRequest {

	@NotNull
	private LocalDate entryDate;

	private String note;
	private boolean milestone;
	private String photoUrl;
	private Map<String, Object> metadata;
}
