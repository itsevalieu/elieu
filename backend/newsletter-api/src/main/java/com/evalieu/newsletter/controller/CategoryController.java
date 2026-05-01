package com.evalieu.newsletter.controller;

import java.util.List;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

import com.evalieu.newsletter.model.Category;
import com.evalieu.newsletter.repository.CategoryRepository;

import lombok.RequiredArgsConstructor;

@RestController
@RequiredArgsConstructor
public class CategoryController {

	private final CategoryRepository categoryRepository;

	@GetMapping("/api/categories")
	public List<Category> list() {
		return categoryRepository.findAllWithSubcategoriesOrdered();
	}
}
