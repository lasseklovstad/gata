package no.gata.backend

import org.springframework.beans.factory.annotation.Autowired
import org.springframework.boot.CommandLineRunner
import org.springframework.boot.SpringApplication
import org.springframework.boot.autoconfigure.SpringBootApplication

@SpringBootApplication
class BackendApplication implements CommandLineRunner {

	@Autowired
	UserRepository userRepository;

	static void main(String[] args) {
		SpringApplication.run(BackendApplication, args)
	}

	@Override
	public void run(String... args) {

		userRepository.save(new User("Lasse Kløvstad"));

	}

}
