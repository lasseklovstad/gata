package no.gata.web.controller

import org.springframework.stereotype.Controller
import org.springframework.web.bind.annotation.RequestMapping

@Controller
class ReactController {
    @RequestMapping(value = ["/{path:[^\\.]*}"])
    fun redirect(): String {
        return "forward:/"
    }
}
