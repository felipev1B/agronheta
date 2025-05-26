import pygame
import random
import sys

# Inicialização do Pygame
pygame.init()

# Configurações da tela
WIDTH, HEIGHT = 800, 600
screen = pygame.display.set_mode((WIDTH, HEIGHT))
pygame.display.set_caption("Campo e Cidade: Corrida pela Igualdade")

# Cores
BLACK = (0, 0, 0)
WHITE = (255, 255, 255)
BROWN = (139, 69, 19)
GREEN = (34, 139, 34)
GRAY = (169, 169, 169)

# Carregar imagens (substitua por suas próprias imagens)
try:
    player_img = pygame.image.load("player.png")
    city_bg = pygame.image.load("city.png")
    country_bg = pygame.image.load("country.png")
except:
    # Placeholders se as imagens não existirem
    player_img = pygame.Surface((50, 80))
    player_img.fill((0, 100, 200))
    city_bg = pygame.Surface((WIDTH, HEIGHT))
    city_bg.fill(GRAY)
    country_bg = pygame.Surface((WIDTH, HEIGHT))
    country_bg.fill(GREEN)

class Player:
    def __init__(self, x, y, name, background):
        self.x = x
        self.y = y
        self.name = name
        self.speed = 5
        self.background = background  # "city" ou "country"
        self.rect = pygame.Rect(x, y, 50, 80)
    
    def move(self, direction):
        if direction == "left" and self.x > 0:
            self.x -= self.speed
        if direction == "right" and self.x < WIDTH - 50:
            self.x += self.speed
        if direction == "up" and self.y > 0:
            self.y -= self.speed
        if direction == "down" and self.y < HEIGHT - 80:
            self.y += self.speed
        
        self.rect = pygame.Rect(self.x, self.y, 50, 80)
    
    def draw(self):
        screen.blit(player_img, (self.x, self.y))
        font = pygame.font.SysFont(None, 24)
        text = font.render(self.name, True, WHITE)
        screen.blit(text, (self.x, self.y - 30))

class Obstacle:
    def __init__(self, x, y, obstacle_type):
        self.x = x
        self.y = y
        self.type = obstacle_type  # "social", "economic", "cultural"
        self.rect = pygame.Rect(x, y, 60, 60)
    
    def draw(self):
        color = BROWN if self.type == "social" else (200, 0, 0) if self.type == "economic" else (0, 0, 200)
        pygame.draw.rect(screen, color, self.rect)

class Game:
    def __init__(self):
        self.players = [
            Player(100, 400, "Joana (Cidade)", "city"),
            Player(100, 500, "Zé (Campo)", "country")
        ]
        self.obstacles = []
        self.current_bg = "city"
        self.clock = pygame.time.Clock()
        self.font = pygame.font.SysFont(None, 36)
        self.generate_obstacles()
    
    def generate_obstacles(self):
        self.obstacles = []
        for i in range(5):
            x = random.randint(200, WIDTH - 100)
            y = random.randint(100, HEIGHT - 100)
            types = ["social", "economic", "cultural"]
            self.obstacles.append(Obstacle(x, y, random.choice(types)))
    
    def switch_background(self):
        self.current_bg = "country" if self.current_bg == "city" else "city"
        self.generate_obstacles()
        for player in self.players:
            player.background = self.current_bg
    
    def check_collisions(self):
        for player in self.players:
            for obstacle in self.obstacles:
                if player.rect.colliderect(obstacle.rect):
                    player.speed = 2  # Reduz velocidade ao colidir
                    return
        
        # Reset speed if no collision
        for player in self.players:
            player.speed = 5
    
    def draw(self):
        # Desenhar fundo
        if self.current_bg == "city":
            screen.blit(city_bg, (0, 0))
        else:
            screen.blit(country_bg, (0, 0))
        
        # Desenhar obstáculos
        for obstacle in self.obstacles:
            obstacle.draw()
        
        # Desenhar jogadores
        for player in self.players:
            player.draw()
        
        # Desenhar informações
        bg_text = self.font.render(f"Cenário: {'Cidade' if self.current_bg == 'city' else 'Campo'}", True, WHITE)
        screen.blit(bg_text, (10, 10))
    
    def run(self):
        running = True
        bg_switch_timer = 0
        
        while running:
            for event in pygame.event.get():
                if event.type == pygame.QUIT:
                    running = False
            
            keys = pygame.key.get_pressed()
            
            # Controles do jogador 1 (setas)
            if keys[pygame.K_LEFT]:
                self.players[0].move("left")
            if keys[pygame.K_RIGHT]:
                self.players[0].move("right")
            if keys[pygame.K_UP]:
                self.players[0].move("up")
            if keys[pygame.K_DOWN]:
                self.players[0].move("down")
            
            # Controles do jogador 2 (WASD)
            if keys[pygame.K_a]:
                self.players[1].move("left")
            if keys[pygame.K_d]:
                self.players[1].move("right")
            if keys[pygame.K_w]:
                self.players[1].move("up")
            if keys[pygame.K_s]:
                self.players[1].move("down")
            
            # Verificar colisões
            self.check_collisions()
            
            # Alternar cenário periodicamente
            bg_switch_timer += 1
            if bg_switch_timer >= 600:  # A cada ~10 segundos
                self.switch_background()
                bg_switch_timer = 0
            
            # Atualizar tela
            self.draw()
            pygame.display.flip()
            self.clock.tick(60)
        
        pygame.quit()
        sys.exit()

if __name__ == "__main__":
    game = Game()
    game.run()
