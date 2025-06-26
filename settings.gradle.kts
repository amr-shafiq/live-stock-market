rootProject.name = "livestockmarket"

pluginManagement {
    plugins {
        id("org.springframework.boot") version "3.4.5"
        id("io.spring.dependency-management") version "1.1.7"
    }
    repositories {
        gradlePluginPortal()
        mavenCentral()
    }
}

