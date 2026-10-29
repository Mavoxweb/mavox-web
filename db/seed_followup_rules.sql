INSERT INTO followup_rules (name, trigger_type, trigger_config, message_template, channel, active)
VALUES
('No Response 1 - Proposta visualizada', 'no_response', '{"days": 2, "min_viewed": true}', 'Vimos que você abriu nossa proposta. Quer falar sobre os próximos passos?', 'whatsapp', true),
('No Response 2 - 7 dias', 'no_response', '{"days": 7, "min_viewed": true}', 'Segunda tentativa: ainda estamos à disposição para ajudar com o projeto.', 'whatsapp', true),
('Stage Stale - Proposta pendente 10d', 'stage_stale', '{"days": 10, "stage": "proposta_enviada"}', 'A proposta está vencendo — vamos conversar para alinhar?', 'whatsapp', true),
('Contrato pendente - 3 dias', 'contract_pending', '{"days": 3, "status": "aprovado"}', 'Próximos passos: assinatura do contrato e início do projeto.', 'whatsapp', true),
('Meeting Needed - 7 dias', 'meeting_needed', '{"days": 7, "stage": "avaliando"}', 'Quer agendar uma reunião para tirar dúvidas?', 'whatsapp', true),
('Re-engage Lost - 90 dias', 're_engage', '{"days": 90, "status": "recusado"}', 'Novidades na Mavox — gostaríamos de reativar o contato.', 'whatsapp', true),
('Re-engage Competitor - 180 dias', 're_engage', '{"days": 180, "lost_reason": "concorrente"}', 'Como estão as coisas? Talvez possamos ajudar de forma diferente.', 'email', true)
ON CONFLICT DO NOTHING;
