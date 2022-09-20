package no.gata.web.controller

import org.springframework.stereotype.Controller
import org.springframework.web.bind.annotation.GetMapping

@Controller
class ReactController {
    @GetMapping("/{path1:[^\\.]+}/{path2:[^\\.]+}/**")
    fun redirect(): String {
        return "forward:/"
    }
}
