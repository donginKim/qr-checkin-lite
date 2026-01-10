package com.yourco.qrcheckin.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
public class WebConfig implements WebMvcConfigurer {

    @Value("${app.upload.path:/app/data/uploads}")
    private String uploadPath;

    @Override
    public void addResourceHandlers(ResourceHandlerRegistry registry) {
        // 업로드된 파일을 /api/uploads/ 경로로 서빙
        String location = uploadPath.startsWith("/") ? "file:" + uploadPath + "/" : "file:./" + uploadPath + "/";
        registry.addResourceHandler("/api/uploads/**")
                .addResourceLocations(location);
    }
}

