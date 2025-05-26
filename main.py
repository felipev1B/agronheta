import pygame
import random
import sys
from enum import Enum

# Inicialização
pygame.init()
pygame.mixer.init()

# Configurações
SCREEN_WIDTH = 1024
SCREEN_HEIGHT = 768
FPS = 60

# Cores
BLACK = (0, 0, 0)
WHITE = (255, 255, 255)
BROWN = (101, 67, 33)
GREEN = (34, 139, 34)
BLUE = (30, 144, 255)

# Estados do jogo
class GameState(Enum):
    MENU = 0
    PLAYING = 1
    STORY = 2
    GAME_OVER = 3

class Player:
    def __init__(self):
        self.image = pygame.Surface((50, 80))
        self.image.fill(BLACK)
        self.rect = self.image.get_rect()
        self.rect.x = 100
        self.rect.y = SCREEN_HEIGHT // 2
        self.speed = 5
        self.stamina = 100
        self.score = 0
        self.history_points = []
        
    def move(self, dx, dy):
        if self.stamina > 0:
            self.rect.x += dx * self.speed
            self.rect.y += dy * self.speed
            self.stamina -= 0.5
            
            # Limites da tela
            self.rect.x = max(0, min(self.rect.x, SCREEN_WIDTH - self.rect.width))
            self.rect.y = max(0, min(self.rect.y, SCREEN_HEIGHT - self.rect.height))
    
    def rest(self):
        self.stamina = min(100, self.stamina + 0.8)
    
    def add_history_point(self, point):
        self.history_points.append(point)
        self.score += 10
        
    def draw(self, screen):
        screen.blit(self.image, self.rect)
        # Barra de stamina
        pygame.draw.rect(screen, BLUE, (self.rect.x, self.rect.y - 10, self.stamina / 2, 5))

class Obstacle:
    def __init__(self, x, y, obstacle_type):
        self.type = obstacle_type
        self.image = pygame.Surface((60, 60))
        colors = {
            "social": (200, 0, 0),
            "economic": (255, 165, 0),
            "racial": (139, 0, 139)
        }
        self.image.fill(colors.get(obstacle_type, BLACK))
        self.rect = self.image.get_rect()
        self.rect.x = x
        self.rect.y = y
        
    def draw(self, screen):
        screen.blit(self.image, self.rect)

class HistoryPoint:
    def __init__(self, x, y, title, description):
        self.rect = pygame.Rect(x, y, 40, 40)
        self.title = title
        self.description = description
        self.collected = False
        
    def draw(self, screen):
        color = GREEN if not self.collected else WHITE
        pygame.draw.circle(screen, color, self.rect.center, 20)

class Game:
    def __init__(self):
        self.screen = pygame.display.set_mode((SCREEN_WIDTH, SCREEN_HEIGHT))
        pygame.display.set_caption("Do Campo à Cidade: A Jornada Negra")
        self.clock = pygame.time.Clock()
        self.font = pygame.font.SysFont("Arial", 24)
        self.big_font = pygame.font.SysFont("Arial", 48)
        self.state = GameState.MENU
        self.player = Player()
        self.obstacles = []
        self.history_points = []
        self.backgrounds = {
            "country": pygame.Surface((SCREEN_WIDTH, SCREEN_HEIGHT)),
            "city": pygame.Surface((SCREEN_WIDTH, SCREEN_HEIGHT))
        }
        self.current_bg = "country"
        self.distance = 0
        self.max_distance = 2000  # Distância total para vencer
        self.load_assets()
        self.setup_game()
        
    def load_assets(self):
        # Carregar imagens (substitua por arquivos reais)
        try:
            self.backgrounds["country"].fill(GREEN)
            self.backgrounds["city"].fill((70, 70, 70))
            # Adicione aqui o carregamento de imagens reais
        except:
            print("Erro ao carregar assets. Usando placeholders.")
        
    def setup_game(self):
        self.generate_obstacles(10)
        self.generate_history_points()
        
    def generate_obstacles(self, count):
        self.obstacles = []
        for _ in range(count):
            x = random.randint(200, SCREEN_WIDTH - 100)
            y = random.randint(100, SCREEN_HEIGHT - 100)
            types = ["social", "economic", "racial"]
            self.obstacles.append(Obstacle(x, y, random.choice(types)))
    
    def generate_history_points(self):
        historical_events = [
            ("Lei Áurea (1888)", "Abolição da escravatura no Brasil"),
            ("Frente Negra (1931)", "Primeira organização política negra no Brasil"),
            ("Zumbi dos Palmares", "Líder do Quilombo dos Palmares"),
            ("Lei 10.639 (2003)", "Obriga ensino da história africana nas escolas"),
            ("Marcha Zumbi (1995)", "Marcha contra racismo em Brasília")
        ]
        
        self.history_points = []
        for i, (title, desc) in enumerate(historical_events):
            x = 300 + i * 150
            y = random.randint(100, SCREEN_HEIGHT - 100)
            self.history_points.append(HistoryPoint(x, y, title, desc))
    
    def handle_events(self):
        for event in pygame.event.get():
            if event.type == pygame.QUIT:
                return False
                
            if event.type == pygame.KEYDOWN:
                if event.key == pygame.K_ESCAPE:
                    if self.state == GameState.PLAYING:
                        self.state = GameState.MENU
                    else:
                        return False
                
                if event.key == pygame.K_RETURN:
                    if self.state == GameState.MENU:
                        self.state = GameState.STORY
                    elif self.state == GameState.STORY:
                        self.state = GameState.PLAYING
                    elif self.state == GameState.GAME_OVER:
                        self.__init__()  # Reinicia o jogo
        
        return True
    
    def update(self):
        if self.state != GameState.PLAYING:
            return
            
        # Movimento do jogador
        keys = pygame.key.get_pressed()
        dx, dy = 0, 0
        if keys[pygame.K_LEFT] or keys[pygame.K_a]:
            dx = -1
        if keys[pygame.K_RIGHT] or keys[pygame.K_d]:
            dx = 1
        if keys[pygame.K_UP] or keys[pygame.K_w]:
            dy = -1
        if keys[pygame.K_DOWN] or keys[pygame.K_s]:
            dy = 1
            
        if dx != 0 or dy != 0:
            self.player.move(dx, dy)
            self.distance += 1
        else:
            self.player.rest()
        
        # Verificar colisões com obstáculos
        for obstacle in self.obstacles:
            if self.player.rect.colliderect(obstacle.rect):
                self.player.stamina -= 2
        
        # Verificar pontos históricos
        for point in self.history_points:
            if not point.collected and self.player.rect.colliderect(point.rect):
                point.collected = True
                self.player.add_history_point(point)
                # Mostrar mensagem sobre o evento histórico
                print(f"Evento: {point.title} - {point.description}")
        
        # Mudar para cenário urbano após certa distância
        if self.distance > self.max_distance // 2 and self.current_bg == "country":
            self.current_bg = "city"
            self.generate_obstacles(15)  # Mais obstáculos na cidade
        
        # Condições de vitória/derrota
        if self.distance >= self.max_distance:
            self.state = GameState.GAME_OVER
        elif self.player.stamina <= 0:
            self.state = GameState.GAME_OVER
    
    def draw(self):
        # Desenhar fundo
        self.screen.blit(self.backgrounds[self.current_bg], (0, 0))
        
        if self.state == GameState.MENU:
            self.draw_menu()
        elif self.state == GameState.STORY:
            self.draw_story()
        elif self.state == GameState.PLAYING:
            self.draw_game()
        elif self.state == GameState.GAME_OVER:
            self.draw_game_over()
        
        pygame.display.flip()
    
    def draw_menu(self):
        title = self.big_font.render("Do Campo à Cidade: A Jornada Negra", True, WHITE)
        start = self.font.render("Pressione ENTER para começar", True, WHITE)
        credit = self.font.render("Um jogo sobre a migração negra no Brasil", True, WHITE)
        
        self.screen.blit(title, (SCREEN_WIDTH//2 - title.get_width()//2, 200))
        self.screen.blit(start, (SCREEN_WIDTH//2 - start.get_width()//2, 400))
        self.screen.blit(credit, (SCREEN_WIDTH//2 - credit.get_width()//2, 500))
    
    def draw_story(self):
        lines = [
            "Anos 1950: O êxodo rural",
            "",
            "Com a mecanização do campo e a promessa de melhores",
            "condições nas cidades, milhares de famílias negras",
            "migraram para os centros urbanos.",
            "",
            "Mas a jornada estava cheia de desafios:",
            "- Preconceito racial",
            "- Dificuldade de emprego",
            "- Falta de moradia digna",
            "",
            "Sua missão é guiar seu personagem nesta jornada,",
            "coletando conquistas históricas da comunidade negra",
            "e evitando os obstáculos no caminho.",
            "",
            "Pressione ENTER para começar"
        ]
        
        y = 100
        for line in lines:
            text = self.font.render(line, True, WHITE)
            self.screen.blit(text, (100, y))
            y += 40
    
    def draw_game(self):
        # Desenhar obstáculos
        for obstacle in self.obstacles:
            obstacle.draw(self.screen)
        
        # Desenhar pontos históricos
        for point in self.history_points:
            point.draw(self.screen)
        
        # Desenhar jogador
        self.player.draw(self.screen)
        
        # UI
        distance_text = self.font.render(f"Distância: {self.distance}/{self.max_distance}", True, WHITE)
        score_text = self.font.render(f"Pontos: {self.player.score}", True, WHITE)
        bg_text = self.font.render(f"Local: {'Campo' if self.current_bg == 'country' else 'Cidade'}", True, WHITE)
        
        self.screen.blit(distance_text, (20, 20))
        self.screen.blit(score_text, (20, 50))
        self.screen.blit(bg_text, (20, 80))
    
    def draw_game_over(self):
        if self.distance >= self.max_distance:
            result = "Você chegou à cidade!"
            color = GREEN
        else:
            result = "Jornada interrompida..."
            color = (200, 0, 0)
        
        result_text = self.big_font.render(result, True, color)
        score_text = self.font.render(f"Pontuação final: {self.player.score}", True, WHITE)
        restart = self.font.render("Pressione ENTER para jogar novamente", True, WHITE)
        
        self.screen.blit(result_text, (SCREEN_WIDTH//2 - result_text.get_width()//2, 300))
        self.screen.blit(score_text, (SCREEN_WIDTH//2 - score_text.get_width()//2, 400))
        self.screen.blit(restart, (SCREEN_WIDTH//2 - restart.get_width()//2, 500))
    
    def run(self):
        running = True
        while running:
            running = self.handle_events()
            self.update()
            self.draw()
            self.clock.tick(FPS)
        
        pygame.quit()
        sys.exit()

if __name__ == "__main__":
    game = Game()
    game.run()
