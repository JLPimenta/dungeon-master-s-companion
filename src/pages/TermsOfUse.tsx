import { AuthLayout } from '@/components/auth/AuthLayout';

export default function TermsOfUse() {
  return (
    <AuthLayout title="Termos de Uso" subtitle="Última atualização: Março de 2026">
      <div className="prose prose-invert max-w-none text-sm space-y-4">
        <p>
          Bem-vindo ao Grimório! Ao acessar e utilizar nossa plataforma, você concorda em cumprir e estar vinculado aos seguintes Termos de Uso. Se você não concorda com qualquer parte destes termos, não utilize nossos serviços.
        </p>
        
        <h3 className="text-lg font-semibold mt-6 text-foreground">1. Natureza do Serviço e Isenção de Garantias ("As-Is")</h3>
        <p>
          O Dungeon Master's Companion é uma ferramenta de auxílio para jogadores e mestres de RPG de mesa, fornecida "como está" (as-is) e "conforme disponível".
        </p>
        <p>
          Nós não garantimos que a plataforma será ininterrupta, livre de erros ou totalmente segura. <strong>Não nos responsabilizamos pela perda de dados (como fichas de personagens, anotações ou campanhas)</strong>. Recomendamos que os usuários mantenham backups de suas informações mais importantes.
        </p>

        <h3 className="text-lg font-semibold mt-6 text-foreground">2. Propriedade Intelectual e Conteúdo de Terceiros</h3>
        <p>
          Esta aplicação é um projeto independente e <strong>não é afiliada, endossada ou patrocinada pela Wizards of the Coast</strong> ou qualquer outra editora de RPG.
        </p>
        <p>
          Todo o conteúdo original dos sistemas de RPG (regras, nomes de monstros, divindades, etc.) pertence aos seus respectivos detentores de direitos autorais. Esta aplicação opera sob os princípios de Uso Justo (Fair Use) e políticas de Conteúdo de Fãs, ou utilizando dados liberados em Open Gaming License (OGL) / Creative Commons, quando aplicável.
        </p>

        <h3 className="text-lg font-semibold mt-6 text-foreground">3. Contas de Usuário e Segurança</h3>
        <p>
          Para utilizar recursos como salvar fichas, você precisará criar uma conta.
        </p>
        <ul className="list-disc pl-5 mt-2 space-y-1">
          <li>Você é responsável por manter a confidencialidade de sua senha (criptografada em nossos sistemas através de JWT).</li>
          <li>Reservamo-nos o direito de suspender ou encerrar contas atreladas a e-mails falsos, que tentem burlar a segurança do sistema (incluindo abuso de API) ou que armazenem conteúdos ilícitos.</li>
        </ul>

        <h3 className="text-lg font-semibold mt-6 text-foreground">4. Uso do Google reCAPTCHA</h3>
        <p>
          Nossa plataforma utiliza o Google reCAPTCHA para proteger o sistema contra spam e abusos por bots. O uso do reCAPTCHA está sujeito à{' '}
          <a href="https://policies.google.com/privacy" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">Política de Privacidade</a>{' '}
          e aos{' '}
          <a href="https://policies.google.com/terms" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">Termos de Serviço</a>{' '}
          do Google.
        </p>

        <h3 className="text-lg font-semibold mt-6 text-foreground">5. Modificações no Serviço</h3>
        <p>
          Como a plataforma está em contínuo desenvolvimento, reservamo-nos o direito de modificar, suspender ou descontinuar qualquer recurso (ou a plataforma inteira) a qualquer momento, sem aviso prévio.
        </p>

        <h3 className="text-lg font-semibold mt-6 text-foreground">6. Privacidade e Dados</h3>
        <p>
          Nós armazenamos apenas os dados essenciais para o funcionamento da sua conta (e-mail, senha criptografada e os dados das suas fichas/campanhas). Não vendemos seus dados para terceiros. O usuário pode, a qualquer momento, solicitar a exclusão permanente de sua conta e de todos os dados associados.
        </p>
      </div>
    </AuthLayout>
  );
}
