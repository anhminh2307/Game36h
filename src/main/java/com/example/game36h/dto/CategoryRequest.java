package com.example.game36h.dto;

import lombok.Data;

@Data
public class CategoryRequest {
    private String name;

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
}
