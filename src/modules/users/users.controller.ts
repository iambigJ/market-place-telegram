import {Body, Controller} from '@nestjs/common';

@Controller('users')
export class UsersController {
    @Post()
    async signup(@Body ){

    }

}
