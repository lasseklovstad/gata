package no.gata.backend

import org.springframework.beans.factory.annotation.Autowired
import org.springframework.web.bind.annotation.GetMapping
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RestController

@RestController
@RequestMapping('api/user')
class UserController {

    @Autowired
    UserRepository userRepository;

    @GetMapping
    List<User> getAllUsers(){
        return userRepository.findAll();
    }
}
