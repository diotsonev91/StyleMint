import './tech.css'

type TechItem = {
  id: number
  name: string
  price: string
  image: string
  condition: string
  description: string
}

const techItems: TechItem[] = [
  {
    id: 1,
    name: 'Sony WH-1000XM5 Headphones',
    price: '299.00',
    image: '/images/tech/sony_wh1000xm5.png',
    condition: 'Like New',
    description: 'Noise-cancelling wireless headphones with immersive sound.',
  },
  {
    id: 2,
    name: 'MacBook Pro M2 13"',
    price: '1199.00',
    image: '/images/tech/macbook_m2.png',
    condition: 'Used – Excellent',
    description: 'Apple M2 chip, 8-core CPU, 10-core GPU, 8GB RAM, 256GB SSD.',
  },
  {
    id: 3,
    name: 'iPhone 14 Pro',
    price: '899.00',
    image: '/images/tech/iphone14pro.png',
    condition: 'Refurbished',
    description: '256GB model, perfect display, battery 94% health.',
  },
  {
    id: 4,
    name: 'Logitech MX Master 3S',
    price: '89.00',
    image: '/images/tech/mx_master3s.png',
    condition: 'New',
    description: 'Silent clicks, ergonomic design, multi-device support.',
  },
]

export default function TechForSale() {
  return (
    <div className="tech-page">
      <header className="tech-header">
        <h1>💻 Tech for Sale</h1>
        <p>Find high-quality new or used gadgets — all verified and ready to ship.</p>
      </header>

      <div className="tech-grid">
        {techItems.map((item) => (
          <div key={item.id} className="tech-card">
            <div className="tech-image">
              <img src={item.image} alt={item.name} />
            </div>
            <div className="tech-info">
              <h2>{item.name}</h2>
              <span className="tech-condition">{item.condition}</span>
              <p className="tech-description">{item.description}</p>
              <div className="tech-footer">
                <span className="tech-price">${item.price}</span>
                <button className="buy-btn">Buy Now</button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
