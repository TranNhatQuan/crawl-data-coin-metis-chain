import { Column, Entity, PrimaryColumn } from 'typeorm'
import { AppBaseEntity } from '../../../base/base.entity'

@Entity({ name: 'CoinGeckoToken' })
export class CoinGeckoToken extends AppBaseEntity {
    @PrimaryColumn()
    id: string

    @Column()
    symbol: string

    @Column()
    name: string

    @Column({ type: 'double' })
    current_price: number

    @Column()
    market_cap: number
}
