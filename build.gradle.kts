plugins {
	java
	id("org.springframework.boot") version "3.4.5"
	id("io.spring.dependency-management") version "1.1.7"
}

sourceSets {
    main {
        java {
            setSrcDirs(listOf("src/main/java"))
        }
    }
}


group = "com.example"
version = "0.0.1-SNAPSHOT"

java {
	toolchain {
		languageVersion = JavaLanguageVersion.of(18)
	}
}

configurations {
	compileOnly {
		extendsFrom(configurations.annotationProcessor.get())
	}
}

repositories {
	mavenCentral()
}

dependencies {
    // ✅ Spring Boot modules
    implementation("org.springframework.boot:spring-boot-starter-web")
    implementation("org.springframework.boot:spring-boot-starter-data-jpa")
    implementation("org.springframework.boot:spring-boot-starter-security")
    implementation("org.springframework.boot:spring-boot-starter-validation")
    implementation("org.springframework.boot:spring-boot-starter-websocket")
    implementation ("io.github.cdimascio:dotenv-java:3.0.0")
    implementation("org.springframework.kafka:spring-kafka")

    // ✅ Lombok
    // compileOnly("org.projectlombok:lombok")
    // annotationProcessor("org.projectlombok:lombok")
    compileOnly("org.projectlombok:lombok:1.18.30")
    annotationProcessor("org.projectlombok:lombok:1.18.30")

    // ✅ Jackson (for ObjectMapper)
    implementation("com.fasterxml.jackson.core:jackson-databind")

    // ✅ JWT Support
    implementation("io.jsonwebtoken:jjwt-api:0.11.5")
    runtimeOnly("io.jsonwebtoken:jjwt-impl:0.11.5")
    runtimeOnly("io.jsonwebtoken:jjwt-jackson:0.11.5")

    // ✅ PostgreSQL DB
    runtimeOnly("org.postgresql:postgresql")

    // ✅ Optional REST client (if using RestTemplate)
    implementation("org.springframework.boot:spring-boot-starter-web")

    // ✅ Dev + test tools
    developmentOnly("org.springframework.boot:spring-boot-devtools")
    testImplementation("org.springframework.boot:spring-boot-starter-test")
    testImplementation("org.springframework.security:spring-security-test")
    testRuntimeOnly("org.junit.platform:junit-platform-launcher")
}


tasks.withType<Test> {
	useJUnitPlatform()
}
